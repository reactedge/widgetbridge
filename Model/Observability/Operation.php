<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Observability;

use OpenTelemetry\API\Trace\SpanInterface;
use ReactEdge\WidgetBridge\Api\OperationInterface;
final class Operation implements OperationInterface
{
    public function __construct(
        private string $id,
        private float $startedAt,
        private string $name,
        private SpanInterface $span,
        private array $data = []
    ) {
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getStartedAt(): float
    {
        return $this->startedAt;
    }

    public function getSpan(): SpanInterface
    {
        return $this->span;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function getTraceId(): string
    {
        return $this->span
            ->getContext()
            ->getTraceId();
    }

    public function getSpanId(): string
    {
        return $this->span
            ->getContext()
            ->getSpanId();
    }
}
