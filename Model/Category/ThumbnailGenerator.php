<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Category;

use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem;
use Magento\Framework\Filesystem\Driver\File;
use Magento\Framework\Image\AdapterFactory;
use Magento\Catalog\Model\Category;

class ThumbnailGenerator
{
    private const THUMBNAIL_SIZE = 100;

    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly AdapterFactory $imageAdapterFactory,
        private readonly File $fileDriver
    ) {
    }

    public function generate(Category $category): ?string
    {
        $image = basename(str_replace('\\', '/', (string) $category->getImage()));

        if ($image === '') {
            return null;
        }

        $mediaDirectory = $this->filesystem->getDirectoryRead(DirectoryList::MEDIA);
        $sourcePath = $mediaDirectory->getAbsolutePath('catalog/category/' . $image);

        if (!$this->fileDriver->isExists($sourcePath)) {
            throw new \RuntimeException(
                sprintf('Category image not found for %s.', $category->getUrlKey())
            );
        }

        $extension = strtolower(pathinfo($image, PATHINFO_EXTENSION)) ?: 'jpg';
        $fileName = sprintf('category-%d.%s', $category->getId(), $extension);
        $relativePath = 'export/categoryfeatured/thumbnails/' . $fileName;
        $varDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::VAR_DIR);
        $targetPath = $varDirectory->getAbsolutePath($relativePath);
        $targetDirectory = dirname($targetPath);

        if (!$this->fileDriver->isDirectory($targetDirectory)) {
            $this->fileDriver->createDirectory($targetDirectory, 0775);
        }

        [$thumbnailWidth, $thumbnailHeight] = $this->getThumbnailDimensions($sourcePath);

        $imageAdapter = $this->imageAdapterFactory->create();
        $imageAdapter->open($sourcePath);
        // Dimensions already preserve the source ratio; don't let the adapter
        // fit the image into a square frame.
        $imageAdapter->keepAspectRatio(false);
        $imageAdapter->keepFrame(false);
        $imageAdapter->keepTransparency(true);
        $imageAdapter->resize($thumbnailWidth, $thumbnailHeight);
        $imageAdapter->save($targetDirectory, $fileName);

        return 'thumbnails/' . $fileName;
    }

    /**
     * @return array{int, int}
     */
    private function getThumbnailDimensions(string $sourcePath): array
    {
        $imageSize = @getimagesize($sourcePath);

        if ($imageSize === false || $imageSize[0] < 1 || $imageSize[1] < 1) {
            throw new \RuntimeException(
                sprintf('Unable to read image dimensions from %s.', $sourcePath)
            );
        }

        [$sourceWidth, $sourceHeight] = $imageSize;
        $scale = min(
            1,
            self::THUMBNAIL_SIZE / max($sourceWidth, $sourceHeight)
        );

        return [
            max(1, (int) floor($sourceWidth * $scale)),
            max(1, (int) floor($sourceHeight * $scale)),
        ];
    }
}
