<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Observability;

use OpenTelemetry\API\Trace\SpanInterface;
use ReactEdge\WidgetBridge\Api\OperationInterface;

final class NullOperation implements OperationInterface
{
    public function getId(): string
    {
        return '';
    }

    public function getName(): string
    {
        return '';
    }

    public function getStartedAt(): float
    {
        return 0.0;
    }

    public function getSpan(): ?SpanInterface
    {
        return null;
    }

    public function getData(): array
    {
        return [];
    }

    public function getTraceId(): string
    {
        return '';
    }

    public function getSpanId(): string
    {
        return '';
    }
}
