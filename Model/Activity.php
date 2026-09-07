<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model;

use OpenTelemetry\API\Trace\StatusCode;
use OpenTelemetry\API\Trace\TracerInterface;
use OpenTelemetry\Context\Context;
use OpenTelemetry\SDK\Trace\TracerProvider;
use ReactEdge\WidgetBridge\Api\ActivityInterface;
use ReactEdge\WidgetBridge\Api\OperationInterface;
use ReactEdge\WidgetBridge\Model\Observability\NullOperation;
use ReactEdge\WidgetBridge\Model\Observability\Operation;
use ReactEdge\WidgetBridge\Model\Observability\TracerProviderFactory;

class Activity implements ActivityInterface
{
    private ?TracerInterface $tracer = null;
    private ?TracerProvider $provider = null;

    public function __construct(
        private Config        $config,
        private TracerProviderFactory $factory
    ) {
        $this->provider = $factory->create(
            $this->config->getObservabilityServiceName(),
            $this->config->getObservabilityCollectorEndpoint()
        );

        if ($this->provider !== null) {
            $this->tracer = $this->provider->getTracer(
                $this->config->getObservabilityServiceName()
            );
        }
    }

    /**
     * {@inheritDoc}
     */
    public function startOperation(
        string $name,
        array $attributes = []
    ): OperationInterface
    {
        if ($this->isCli() || !$this->tracer) {
            return new NullOperation();
        }

        $span = $this->tracer
            ->spanBuilder($name)
            ->startSpan();

        foreach ($attributes as $key => $value) {
            $span->setAttribute($key, $value);
        }

        return new Operation(
            bin2hex(random_bytes(16)),
            microtime(true),
            $name,
            $span,
            $attributes
        );
    }

    /**
     * {@inheritDoc}
     */
    public function endOperation(
        OperationInterface $operation,
        array $attributes = []
    ): void
    {
        if (!$operation instanceof Operation) {
            return;
        }

        $durationMs = (microtime(true) - $operation->getStartedAt()) * 1000;

        $span = $operation->getSpan();

        $span->setAttribute(
            'duration.ms',
            (int) $durationMs
        );

        $span->setAttribute(
            'operation.id',
            $operation->getId()
        );

        foreach ($attributes as $key => $value) {
            $span->setAttribute($key, $value);
        }

        $span->setAttribute('status', StatusCode::STATUS_OK);
        $span->end();
    }

    /**
     *{@inheritDoc}
     */
    public function failOperation(
        OperationInterface $operation,
        array $attributes = []
    ): void
    {
        if (!$operation instanceof Operation) {
            return;
        }

        $durationMs = (microtime(true) - $operation->getStartedAt()) * 1000;

        $span = $operation->getSpan();

        $span->setAttribute(
            'duration.ms',
            (int) $durationMs
        );

        foreach ($attributes as $key => $value) {
            $span->setAttribute($key, $value);
        }

        $span->setStatus(StatusCode::STATUS_ERROR);
        $span->end();
    }

    /**
     * Records an event against an existing operation.
     *
     * Events provide additional context within an operation
     * without creating additional spans.
     */
    public function addEvent(
        OperationInterface $operation,
        string $name,
        array $attributes = []
    ): void {
        if ($operation instanceof Operation) {
            $operation
                ->getSpan()
                ->addEvent(
                    $name,
                    $attributes
                );
        }
    }

    public function startChildOperation(
        OperationInterface $parent,
        string $name,
        array $attributes = []
    ): OperationInterface
    {
        if ($this->isCli() || !$this->tracer) {
            return new NullOperation();
        }

        $span = $this->tracer
            ->spanBuilder($name)
            ->setParent(
                $parent->getSpan()->storeInContext(
                    Context::getCurrent()
                )
            )
            ->startSpan();

        foreach ($attributes as $key => $value) {
            $span->setAttribute($key, $value);
        }

        return new Operation(
            bin2hex(random_bytes(16)),
            microtime(true),
            $name,
            $span,
            $attributes
        );
    }

    /**
     * {@inheritDoc}
     */
    public function recordEvent(
        string $serviceName,
        string $name,
        array $payload = [],
    ): void
    {
        if ($this->isCli() || $this->provider === null) {
            return;
        }

        $this->tracer = $this->provider->getTracer(
            $serviceName
        );

        $span = $this->tracer
            ->spanBuilder($name)
            ->startSpan();

        foreach ($payload as $key => $value) {
            $span->setAttribute(
                $key,
                $value
            );
        }

        $span->end();
    }

    private function isCli(): bool
    {
        return PHP_SAPI === 'cli';
    }
}
