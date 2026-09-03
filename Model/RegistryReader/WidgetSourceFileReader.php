<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\RegistryReader;

use Magento\Framework\Filesystem\Driver\File as FileDriver;

class WidgetSourceFileReader
{
    public function __construct(
        private FileDriver            $fileDriver,
        private AssetsReader $assetsReader,
        private WidgetSourceFileWriter $widgetSourceFileWriter
    ) {
    }

    public function loadSourceFile(string $widgetId, string $css): string
    {
        if (!$this->isPublished($css)) {
            $content = $this->assetsReader->readFileAssetContent($widgetId, $css);

            $this->widgetSourceFileWriter->publish($css, $content);
        }

        return $this->assetsReader->readPublishedAsset($css);
    }

    private function isPublished(string $path): bool
    {
        return $this->fileDriver->isExists(BP . '/pub/reactedge' . $path);
    }

}
