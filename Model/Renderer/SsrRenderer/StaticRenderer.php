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
        private SsrAssetReader $ssrAssetReader,
        private SerializerInterface   $serializer,
    ) {
    }

    public function render(
        OperationInterface $operation,
        Contract $contract,
        string $output
    ): array {
        $css = $contract->getSsrCss();
        $ssr =  $this->ssrAssetReader->getSsr(
            $contract->getId(),
            $output,
            $this->siteViewModeReader->getViewPort(),
        );

        if ($ssr === '')
            return [];

        $ssrData = $this->serializer->unserialize($ssr);

        $html = $css . $ssrData['html']?? '';
        $bootstrap = $ssrData['bootstrap']?? '';

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

        return [
            'html' => $html,
            'bootstrap' => $bootstrap,
        ];
    }
}
