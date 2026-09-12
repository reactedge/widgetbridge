<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model;

use Magento\Framework\Filesystem\Driver\File as FileDriver;
use Magento\Framework\Serialize\SerializerInterface;

class ExportWriter
{
    public function __construct(
        private readonly FileDriver $file,
        private readonly SerializerInterface $serializer
    ) {
    }

    public function writeProductFile(array $data, string $path): void
    {
        $directory = BP . '/var/export/';
        $target = $directory . ltrim($path, '/');
        $targetDirectory = dirname($target);

        if (!$this->file->isDirectory($targetDirectory)) {
            $this->file->createDirectory($targetDirectory, 0775);
        }

        $json = $this->serializer->serialize($data);

        $this->file->filePutContents(
            $target,
            json_encode(
                json_decode($json, true, 512, JSON_THROW_ON_ERROR),
                JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
            )
        );
    }
}
