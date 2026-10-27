<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer;

use ReactEdge\WidgetBridge\Api\OperationInterface;
use ReactEdge\WidgetBridge\Model\Config;
use ReactEdge\WidgetBridge\Model\Observability\Context;

class SsrOutputReader
{
    private const PRODUCT_CONTEXT_WIDGETS = [
        Config::WIDGET_PRODUCT_GALLERY,
        Config::WIDGET_SIZE_GUIDE,
    ];

    private const CATEGORY_CONTEXT_WIDGETS = [
        Config::WIDGET_CATEGORY_FAQ,
        Config::WIDGET_CATEGORY_FEATURED,
    ];

    public function __construct(
        private readonly SsrAssetReader $ssrAssetReader,
        private readonly Context $context
    ) {
    }

    public function read(
        string $widgetId,
        string $variant,
        OperationInterface $operation
    ): string {
        return $this->ssrAssetReader->getSsr(
            $widgetId,
            $this->getOutputFileName($widgetId),
            $variant,
            $operation
        );
    }

    private function getOutputFileName(string $widgetId): string
    {
        $entityId = match (true) {
            in_array($widgetId, self::PRODUCT_CONTEXT_WIDGETS, true) => $this->context->getSku(),
            in_array($widgetId, self::CATEGORY_CONTEXT_WIDGETS, true) => $this->context->getCategory(),
            default => null,
        };

        if ($entityId === null || !$this->isSafeFileIdentifier($entityId)) {
            return 'output.json';
        }

        return sprintf('output-%s.json', $entityId);
    }

    private function isSafeFileIdentifier(string $identifier): bool
    {
        return preg_match('/^[A-Za-z0-9._-]+$/D', $identifier) === 1;
    }
}
