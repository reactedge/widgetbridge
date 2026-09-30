<?php

declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use ReactEdge\WidgetBridge\Model\Observability\PageTrace;

final class EndPageTrace implements ObserverInterface
{
    public function __construct(
        private PageTrace $pageTrace
    ) {
    }

    public function execute(Observer $observer): void
    {
        $this->pageTrace->finish();
    }
}
