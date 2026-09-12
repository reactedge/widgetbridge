<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\RegistryReader;

use Magento\Framework\Filesystem\Driver\File as FileDriver;

class WidgetSourceFileWriter
{
    public function __construct(
        private readonly FileDriver $file
    ) {
    }

    public function publish(string $path, string $content)
    {
        $directory = BP . '/pub/reactedge/';
        $target = $directory . ltrim($path, '/');
        $targetDirectory = dirname($target);

        if (!$this->file->isDirectory($targetDirectory)) {
            $this->file->createDirectory($targetDirectory, 0775);
        }

        $this->file->filePutContents(
            $target,
            $content
        );
    }
}
