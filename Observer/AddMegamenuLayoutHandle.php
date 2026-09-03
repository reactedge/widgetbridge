<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Observer;

use Magento\Framework\Event\Observer;
use Magento\Store\Model\ScopeInterface;
use ReactEdge\WidgetBridge\Model\Config;

class AddMegamenuLayoutHandle implements \Magento\Framework\Event\ObserverInterface
{
    /**
     * @param Config $config
     */
    public function __construct(
        private Config $config
    ) {
    }

    public function execute(Observer $observer): void
    {
        if (!$this->config->isEnabled(Config::WIDGET_MEGAMENU)) {
            return;
        }

        $layout = $observer->getEvent()->getLayout();

        $layout->getUpdate()->addHandle(
            'reactedge_megamenu_enabled'
        );
    }
}
