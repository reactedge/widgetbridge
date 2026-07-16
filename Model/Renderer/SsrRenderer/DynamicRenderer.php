<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer;

use Laminas\ReCaptcha\Exception;
use ReactEdge\WidgetBridge\Api\ActivityInterface;
use ReactEdge\OpenTelemetry\Api\OperationInterface;

class DynamicRenderer
{

    public function __construct(
        private SsrApi             $ssrApi,
        private ActivityInterface  $activity,
        private SsrSnapshotStorage $snapshotStorage,
        private SsrCacheHandler $ssrCacheHandler
    ) {
    }

    public function render(
        OperationInterface $render,
        Contract $contract,
        string $widgetId
    ): string {
        $payload = [
            'widgetId' => $widgetId,
            'widget' => $contract->getWidget(),
            'contract' => $contract->getContract(),
            'contractFile' => $contract->getContractFile(),
        ];

        $cachedHtml = $this->ssrCacheHandler->loadCache($payload);

        if ($cachedHtml !== null) {
            $this->activity->addEvent(
                $render,
                'ssr.cache.hit',
                [
                    'widget.id' => $payload['widgetId'] ?? null,
                    'widget' => $payload['widget'] ?? null,
                ]
            );

            return $cachedHtml;
        }

        $ssrRequest = $this->activity->startChildOperation(
            $render,
            'ssr.api.request',
            [
                'widget.id' => $widgetId,
                'contract.widget' => $contract->getWidget(),
                'contract.file' => $contract->getContractFile(),
            ]
        );

        try {
            $result = $this->ssrApi->requestSSR($ssrRequest, $payload);
            $this->ssrCacheHandler->saveCache($payload, $result);

            $this->activity->endOperation(
                $ssrRequest,
                [
                    'api_response.is_string' => is_string($result),
                    'api_response.length' => is_string($result) ? strlen($result) : 0,
                ]
            );

            $ssr = is_string($result) ? $result : '';
            if ($result) {
                $html = $contract->getSsrCss() . $ssr;
            } else {
                throw new Exception('Could not generate a valid SSR content.');
            }

            $this->snapshotStorage->save(
                $render->getId(),
                $html
            );

            $this->activity->addEvent(
                $render,
                'SSR Dynamic Render Completed',
                [
                    'css.length' => strlen($contract->getSsrCss()),
                    'ssr.length' => strlen($ssr),
                    'html.length' => strlen($html),
                    'snapshot.saved' => $render->getId() . '.html',
                ]
            );

            $this->activity->endOperation(
                $render,
                [
                    'html.length' => strlen($html),
                    'html.hash' => md5($html),
                    'snapshot.id' => $render->getId(),
                ]
            );

            return $html;
        } catch (\Throwable $e) {
            $this->activity->failOperation(
                $ssrRequest,
                [
                    'exception.class' => get_class($e),
                    'exception.message' => $e->getMessage(),
                ]
            );

            throw $e;
        }
    }
}
