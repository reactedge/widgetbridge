<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer;

use ReactEdge\WidgetBridge\Api\ActivityInterface;
use ReactEdge\WidgetBridge\Api\OperationInterface;

class StaticRenderer
{
    public function __construct(
        private ActivityInterface $activity,
        private SiteViewModeReader $siteViewModeReader
    ) {
    }

    public function render(
        OperationInterface $operation,
        Contract $contract
    ): string {
        $css = $contract->getSsrCss();
        $html = $css . $contract->getSsrHtml(
            $this->siteViewModeReader->getViewPort()
            );

        $this->activity->addEvent(
            $operation,
            'SSR Static Render Completed',
            [
                'css.length' => strlen($css),
                'ssr.length' => strlen($html)
            ]
        );

        $this->activity->endOperation(
            $operation,
            [
                'html.hash' => md5($html),
                'snapshot.id' => $operation->getId(),
            ]
        );

        return $html;
    }
}
