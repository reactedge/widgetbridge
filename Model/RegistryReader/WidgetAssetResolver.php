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
        if (isset($contract['src'])) {
            $contract['src'] = $this->sourceFileReader->loadSourceFile(
                $contract['id'],
                $contract['src']
            );
        }

        if (isset($contract['css'])) {
            $contract['css'] = $this->sourceFileReader->loadSourceFile(
                $contract['id'],
                $contract['css']
            );
        }

        return $contract;
    }
}
