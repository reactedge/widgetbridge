<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Renderer;

use Magento\Framework\App\RequestInterface;
use ReactEdge\WidgetBridge\Api\OperationInterface;
use ReactEdge\WidgetBridge\Api\ActivityInterface;
use ReactEdge\WidgetBridge\Model\Config;
use ReactEdge\WidgetBridge\Model\Observability\Context;
use ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer\ContractValidator;
use ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer\DynamicRenderer;
use ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer\SiteViewModeReader;
use ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer\StaticRenderer;

class SsrRenderer
{
    public function __construct(
        private Config             $config,
        private StaticRenderer $staticRenderer,
        private DynamicRenderer $dynamicRenderer,
        private ContractValidator $contractValidator,
        private RequestInterface $request,
        private SiteViewModeReader $siteViewModeReader,
        private ActivityInterface $activity,
        private readonly Context $context
    ) {
    }

    public function render(string $widgetId): string
    {
        $render = $this->logSsrRender($widgetId);

        if (!$this->config->getWidgetsSSREngineEnabled()) {
            $this->logSsrRenderFailed($render, $widgetId);
            return '';
        }

        $contract = $this->contractValidator->validate(
            $render,
            $widgetId
        );

        if ($contract === null) {
            $this->activity->endOperation(
                $render,
                [
                    'contract' => null
                ]
            );
            return '';
        }

        if ($contract->getRenderingStrategy() === 'disabled') {
            $this->activity->endOperation(
                $render,
                [
                    'strategy' => 'disabled'
                ]
            );
            return '';
        }

        if ($contract->hasStaticSsr(
            $this->siteViewModeReader->getViewPort()
        )) {
            return $this->staticRenderer->render(
                $render,
                $contract,
                ($widgetId=== 'productgallery')? sprintf('output-%s.html', $this->context->getEntityId()): 'output.html'
            );
        }

        try {
            $result = $this->dynamicRenderer->render($render, $contract, $widgetId);

            $this->activity->addEvent(
                $render,
                'SSR Dynamic Render Completed',
                [
                    'css.length' => strlen($contract->getSsrCss()),
                    'ssr.length' => strlen($result),
                    'snapshot.saved' => $render->getId() . '.html'
                ]
            );
            $this->activity->endOperation(
                $render,
            );

            return $result;
        } catch (\Throwable $e) {
            $this->activity->failOperation(
                $render,
                [
                    'widget.id' => $widgetId,
                    'exception.class' => get_class($e),
                    'exception.message' => $e->getMessage(),
                ]
            );

            return '';
        }
    }

    private function logSsrRender(
        string $widgetId
    ): OperationInterface
    {
        $requestUri = $this->request->getRequestUri();
        $entity = $this->context->getEntityId();

        return $this->activity->startOperation(
            "ssr.render-$widgetId-$entity",
            [
                'widget.id' => $widgetId,
                'request.uri' => $requestUri,
            ]
        );
    }

    private function logSsrRenderFailed(
        OperationInterface $render,
        string $widgetId
    ): void
    {
        $this->activity->failOperation($render, [
            'ssr.disabled' => true,
            'widget.id' => $widgetId,
        ]);
    }
}
