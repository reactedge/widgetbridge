<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\RegistryReader;

class WidgetSourceFileWriter
{

    public function publish(string $path, string $content)
    {
        $directory = BP . '/pub/reactedge/';

        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        file_put_contents(
            $directory . $path,
            $content
        );
    }
}
