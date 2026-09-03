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
        return array_unique(
            array_filter(
                array_map(
                    fn (string $widgetId) =>
                        $this->registryReader->getWidgetContract($widgetId)['css'] ?? null,
                    $this->registryReader->getMainActiveWidgets()
                )
            )
        );
    }
}
