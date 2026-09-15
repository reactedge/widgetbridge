<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\RegistryReader;

class WidgetAssetResolver
{
    public function __construct(
        private WidgetSourceFileReader $sourceFileReader
    ) {}

    public function resolve(array $contract): array
    {
        $widget = $contract['widget'] ?? $contract['id'];

        if (isset($contract['src'])) {
            $contract['src'] = $this->sourceFileReader->loadSourceFile(
                $widget,
                $contract['src']
            );
        }

        if (isset($contract['css'])) {
            $contract['css'] = $this->sourceFileReader->loadSourceFile(
                $widget,
                $contract['css']
            );
        }

        return $contract;
    }
}
