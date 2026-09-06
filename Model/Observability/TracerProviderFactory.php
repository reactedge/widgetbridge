<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Observability;

use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use OpenTelemetry\SDK\Resource\ResourceInfo;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;

class TracerProviderFactory
{
    public function create(
        string $serviceName,
        string $collectorEndPoint
    ): TracerProvider {
        $resource = ResourceInfo::create(
            Attributes::create([
                'service.name' => $serviceName
            ])
        );

        $transport = (new OtlpHttpTransportFactory())->create(
            $collectorEndPoint,
            'application/x-protobuf'
        );

        $exporter = new SpanExporter($transport);

        $tracerProvider = new TracerProvider(
            new SimpleSpanProcessor($exporter),
            null,
            $resource
        );

        return $tracerProvider;
    }
}
