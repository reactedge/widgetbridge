<?php

declare(strict_types=1);

namespace ReactEdge\WidgetBridge\ViewModel;

use Magento\Framework\Serialize\SerializerInterface;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use ReactEdge\WidgetBridge\Model\Config;
use ReactEdge\WidgetBridge\Model\Config\ProductReader;
use ReactEdge\WidgetBridge\Model\Config\Runtime as RuntimeConfig;
use ReactEdge\WidgetBridge\Model\RegistryReader;
use ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer;

class Widget implements ArgumentInterface
{
    private $ssrData = null;

    public function __construct(
        private Config                $config,
        private RegistryReader        $registryReader,
        private SsrRenderer           $ssrRenderer,
        private RuntimeConfig         $runtimeConfig,
        private SerializerInterface   $serializer,
        private ProductReader $productReader,
    ) {}

    public function isEnabled(mixed $widgetId): bool
    {
        return $this->config->isEnabled($widgetId);
    }

    public function getCurrentProduct()
    {
        return $this->productReader->getCurrentProduct();
    }

    public function getRuntimeRegistry(): array
    {
        $data = $this->registryReader->getWidgetsContract();
        return is_array($data) ? $data : [];
    }

    public function getWidgetSSRHtml(string $widgetId): string
    {
        return $this->getWidgetSSR($widgetId)['html'] ?? '';
    }

    public function getWidgetSSRData(string $widgetId): mixed
    {
        return $this->serializer->serialize($this->getWidgetSSR($widgetId)['bootstrap']) ?? null;
    }

    public function getRuntimeConfig()
    {
        $data = $this->runtimeConfig->getRuntimeConfig();
        return $this->serializer->serialize($data);
    }

    private function getWidgetSSR(string $widgetId): array
    {
        if (!isset($this->ssrData[$widgetId])) {
            $this->ssrData[$widgetId] = $this->ssrRenderer->render($widgetId);
        }

        if (empty($this->ssrData[$widgetId])) {
            return SsrRenderer::DEFAULT_SSR;
        }

        return $this->ssrData[$widgetId];
    }
}
