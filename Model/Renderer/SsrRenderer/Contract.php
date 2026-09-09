<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer;

final class Contract
{
    public function __construct(
        private string $id,
        private string $widget,
        private array $contract,
        private string $contractFile,
        private array $ssr,
        private string $css,
        private string $src
    ) {
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getWidget(): string
    {
        return $this->widget;
    }

    public function getContract(): array
    {
        return $this->contract;
    }

    public function getContractFile(): string
    {
        return $this->contractFile;
    }

    public function hasStaticSsr(string $variant = 'desktop'): bool
    {
        return $this->getRenderingStrategy() === 'static';
    }

    public function getCss(): string
    {
        return $this->css;
    }

    public function getSrc(): string
    {
        return $this->src;
    }

    public function hasCssSsr(): bool
    {
        return ($this->ssr['css'] ?? '') !== '';
    }

    /**
     * Return the ssr generated during the deployment
     *
     * @return string
     */
    public function getSsrHtml(string $variant = 'desktop'): string
    {
        return $this->ssr['views'][$variant]
            ?? $this->ssr['views']['desktop']
            ?? '';
    }

    public function getSsrCss(): string
    {
        return $this->hasCssSsr()
            ? "<style>{$this->ssr['css']}</style>"
            : '';
    }

    public function getRenderingStrategy(): string
    {
        return $this->ssr['strategy'] ?? 'static';
    }
}
