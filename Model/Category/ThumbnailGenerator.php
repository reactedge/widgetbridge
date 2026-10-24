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

        $imageAdapter = $this->imageAdapterFactory->create();
        $imageAdapter->open($sourcePath);
        $imageAdapter->keepAspectRatio(true);
        $imageAdapter->keepFrame(false);
        $imageAdapter->keepTransparency(true);
        $imageAdapter->constrainOnly(true);
        $imageAdapter->resize(self::THUMBNAIL_SIZE, self::THUMBNAIL_SIZE);
        $imageAdapter->save($targetDirectory, $fileName);

        return 'thumbnails/' . $fileName;
    }
}
