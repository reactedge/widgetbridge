<?php

namespace ReactEdge\WidgetBridge\Api;

use OpenTelemetry\API\Trace\SpanInterface;

interface OperationInterface
{
    public function getId(): string;

    public function getName(): string;

    public function getStartedAt(): float;

    public function getSpan(): ?SpanInterface;

    public function getData(): array;

    public function getTraceId(): string;

    public function getSpanId(): string;
}

