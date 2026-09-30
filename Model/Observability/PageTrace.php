<?php

declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Observability;

use Magento\Framework\App\Request\Http;
use ReactEdge\WidgetBridge\Api\ActivityInterface;
use ReactEdge\WidgetBridge\Api\OperationInterface;

final class PageTrace
{
    private ?OperationInterface $operation = null;
    private bool $finished = false;

    public function __construct(
        private ActivityInterface $activity,
        private Context $context,
        private Http $request
    ) {
    }

    public function start(): void
    {
        if ($this->operation !== null) {
            return;
        }

        $sku = $this->context->getSku();
        $category = $sku === null
            ? $this->context->getCategory()
            : null;

        $attributes = [
            'url.path' => (string) $this->request->getPathInfo(),
            'http.route' => (string) $this->request->getFullActionName(),
            'user_agent.original' => (string) $this->request->getHeader('User-Agent'),
            'reactedge.page.type' => $sku !== null
                ? 'product'
                : ($category !== null ? 'category' : 'page'),
            'reactedge.entity.id' => $sku ?? $category ?? 'page',
        ];

        if ($sku !== null) {
            $attributes['product.sku'] = $sku;
        }

        if ($category !== null) {
            $attributes['category.url_key'] = $category;
        }

        $this->operation = $this->activity->startOperation(
            'reactedge.page.render',
            $attributes
        );
    }

    public function finish(): void
    {
        if ($this->operation === null || $this->finished) {
            return;
        }

        $this->activity->endOperation($this->operation);
        $this->finished = true;
    }

    /**
     * Returns the server-render trace provenance required by the browser runtime.
     *
     * The browser should link its own page/widget spans to this context rather
     * than treat it as a parent because this markup may subsequently be cached.
     *
     * @return array<string, int|string>
     */
    public function getBrowserContext(): array
    {
        if ($this->operation === null) {
            return [];
        }

        $traceId = $this->operation->getTraceId();
        $spanId = $this->operation->getSpanId();

        if ($traceId === '' || $spanId === '') {
            return [];
        }

        $traceFlags = $this->operation
            ->getSpan()
            ?->getContext()
            ->getTraceFlags() ?? 0;

        return [
            'renderId' => $this->operation->getId(),
            'traceId' => $traceId,
            'spanId' => $spanId,
            'traceFlags' => $traceFlags,
            'traceparent' => sprintf(
                '00-%s-%s-%02x',
                $traceId,
                $spanId,
                $traceFlags & 0xff
            ),
        ];
    }
}
