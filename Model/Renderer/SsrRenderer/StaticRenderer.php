<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer;

use Magento\Framework\Serialize\SerializerInterface;
use ReactEdge\WidgetBridge\Api\ActivityInterface;
use ReactEdge\WidgetBridge\Api\OperationInterface;

class StaticRenderer
{
    public function __construct(
        private ActivityInterface $activity,
        private SiteViewModeReader $siteViewModeReader,
        private SsrOutputReader $ssrOutputReader,
        private SerializerInterface   $serializer
    ) {
    }

    public function render(
        OperationInterface $operation,
        Contract $contract
    ): array {
        $ssrRequest = $this->activity->startChildOperation(
            $operation,
            'ssr.static.request',
            [
                'widget.id' => $contract->getId(),
                'contract.widget' => $contract->getWidget(),
                'contract.file' => $contract->getContractFile(),
            ]
        );

        $css = $contract->getSsrCss();
        $ssr = $this->ssrOutputReader->read(
            $contract->getId(),
            $this->siteViewModeReader->getViewPort(),
            $ssrRequest
        );

        if ($ssr === '') {
            $this->activity->endOperation(
                $ssrRequest,
                [
                    'widget.id' => $contract->getId(),
                    'error' => 'ssr empty'
                ]
            );
            return [];
        }

        $ssrData = $this->serializer->unserialize($ssr);

        $html = $css . ($ssrData['html'] ?? '');
        $bootstrap = $ssrData['bootstrap'] ?? '';

        $this->activity->addEvent(
            $ssrRequest,
            'SSR Static Render Completed',
            [
                'css.length' => strlen($contract->getSsrCss()),
                'ssr.length' => strlen($ssr),
                'html.length' => strlen($html)
            ]
        );
        $this->activity->endOperation(
            $ssrRequest
        );

        return [
            'html' => $html,
            'bootstrap' => $bootstrap,
        ];
    }
}
