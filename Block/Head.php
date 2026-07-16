<?php

declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use ReactEdge\WidgetBridge\Model\RegistryReader;

class Head extends Template
{

    /**
     * @param Context $context
     * @param RegistryReader $registryReader
     */
    public function __construct(
        Template\Context       $context,
        private RegistryReader $registryReader,
        array                  $data = []
    ) {
        parent::__construct($context, $data);
    }

    public function getCssAssets()
    {
        foreach ($this->registryReader->getMainActiveWidgets() as $widgetId) {
            $contract = $this->registryReader->getWidgetContract($widgetId);

            $css = $contract['css'] ?? null;

            if ($css) {
                $assets[] = $css;
            }
        }

        return array_unique($assets);
    }
}
