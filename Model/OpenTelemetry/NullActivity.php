<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\OpenTelemetry;

use ReactEdge\WidgetBridge\Api\OperationInterface;
use ReactEdge\WidgetBridge\Api\ActivityInterface;
use ReactEdge\WidgetBridge\Model\Observability\NullOperation;

class NullActivity implements ActivityInterface
{

    public function startOperation(string $name, array $attributes = []): OperationInterface
    {
        return new NullOperation();
    }

    public function endOperation(OperationInterface $operation, array $attributes = []): void
    {
    }

    public function failOperation(OperationInterface $operation, array $attributes = []): void
    {
    }

    public function addEvent(OperationInterface $operation, string $name, array $attributes = []): void
    {

    }

    public function startChildOperation(OperationInterface $parent, string $name, array $attributes = []): OperationInterface
    {
        return new NullOperation();
    }

    public function recordEvent(string $serviceName, string $name, array $payload = []): void
    {

    }
}
