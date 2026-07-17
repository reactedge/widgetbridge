<?php

declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model;

use InvalidArgumentException;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;
use Magento\Store\Model\StoreManagerInterface;

class Config
{
    private const XML_PATH_SRI_ENABLED = 'reactedge/sri/enabled';
    private const XML_PATH_GOOGLE_MAPS_API_KEY = 'reactedge/google_maps/api_key';
    private const XML_PATH_GOOGLE_MAPS_PLACE_ID = 'reactedge/google_maps/place_id';
    private const XML_PATH_INTENT_API_BASE_URL = 'reactedge/intent_api/base_url';

    private const XML_PATH_SSR_API_BASE_URL = 'reactedge/widgets_ssr/base_url';

    private const XML_PATH_SSR_API_ENABLED = 'reactedge/widgets_ssr/enabled';
    private const XML_PATH_BASE_URL = 'web/secure/base_url';

    private const XML_PATH_PREFIX = 'reactedge';

    private const XML_PATH_ENVIRONMENT = 'reactedge/assetdir/environment';

    public const WIDGET_USP = 'usp';
    public const WIDGET_BANNER = 'banner';
    public const WIDGET_BANNER_MULTI = 'bannermulti';
    public const WIDGET_GOOGLE_REVIEWS = 'googlereviews';
    public const WIDGET_TRUSTPILOT = 'trustpilot';
    public const WIDGET_STOREFINDER = 'storefinder';
    public const WIDGET_MEGAMENU = 'megamenu';
    public const WIDGET_MINICART = 'minicart';
    public const WIDGET_INTENTDISCOVERY = 'intentdiscovery';
    private const ALLOWED_WIDGETS = [
        self::WIDGET_USP,
        self::WIDGET_BANNER,
        self::WIDGET_BANNER_MULTI,
        self::WIDGET_GOOGLE_REVIEWS,
        self::WIDGET_TRUSTPILOT,
        self::WIDGET_STOREFINDER,
        self::WIDGET_MEGAMENU,
        self::WIDGET_MINICART,
        self::WIDGET_INTENTDISCOVERY,
    ];

    public function __construct(
        private ScopeConfigInterface $scopeConfig,
        private StoreManagerInterface  $storeManager
    ) {}

    private function validateWidget(string $widgetId): void
    {
        if (!in_array($widgetId, self::ALLOWED_WIDGETS, true)) {
            throw new InvalidArgumentException(
                sprintf('Unknown ReactEdge widget "%s"', $widgetId)
            );
        }
    }

    public function isEnabled(string $widgetId, ?string $scopeCode = null): bool
    {
        $this->validateWidget($widgetId);

        return $this->scopeConfig->isSetFlag(
            sprintf('%s/%s/enabled', self::XML_PATH_PREFIX, $widgetId),
            ScopeInterface::SCOPE_STORE,
            $scopeCode
        );
    }

    public function getScriptUrl(string $widgetId, ?string $scopeCode = null): string
    {
        $this->validateWidget($widgetId);

        $baseUrl = rtrim(
            (string) $this->scopeConfig->getValue(
                sprintf('%s/%s/base_url', self::XML_PATH_PREFIX, $widgetId),
                ScopeInterface::SCOPE_STORE,
                $scopeCode
            ),
            '/'
        );

        $hash = $this->getScriptIntegrity($widgetId, $scopeCode);

        return sprintf(
            '%s/widget-%s@%s.iife.js',
            $baseUrl,
            $widgetId,
            $hash
        );
    }

    public function getScriptIntegrity(string $widgetId, ?string $scopeCode = null)
    {
        return $this->scopeConfig->getValue(
            sprintf('%s/%s/hash', self::XML_PATH_PREFIX, $widgetId),
            ScopeInterface::SCOPE_STORE,
            $scopeCode
        );
    }

    public function isSriEnabled(): bool
    {
        return $this->scopeConfig->isSetFlag(self::XML_PATH_SRI_ENABLED);
    }

    public function getContractUrl(
        string $widgetId,
        ?string $scopeCode = null
    ): string {
        $this->validateWidget($widgetId);

        $baseUrl = rtrim(
            (string) $this->scopeConfig->getValue(
                sprintf('%s/%s/base_url', self::XML_PATH_PREFIX, $widgetId),
                ScopeInterface::SCOPE_STORE,
                $scopeCode
            ),
            '/'
        );

        $contractPath = (string) $this->scopeConfig->getValue(
            sprintf('%s/%s/%s', self::XML_PATH_PREFIX, $widgetId, 'contract_path'),
            ScopeInterface::SCOPE_STORE,
            $scopeCode
        );

        return $baseUrl . $contractPath;
    }

    public function getGoogleMapsApiKey(): ?string
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_GOOGLE_MAPS_API_KEY,
            ScopeInterface::SCOPE_STORE
        );
    }

    public function getGooglePlaceId(): ?string
    {
        return $this->scopeConfig->getValue(
            self::XML_PATH_GOOGLE_MAPS_PLACE_ID,
            ScopeInterface::SCOPE_STORE
        );
    }

    public function getIntentApiBaseUrl(): ?string
    {
        return $this->scopeConfig->getValue(self::XML_PATH_INTENT_API_BASE_URL);
    }

    public function getBaseUrl(): ?string
    {
        $baseUrl = rtrim(
            (string) $this->scopeConfig->getValue(
                self::XML_PATH_BASE_URL,
                ScopeInterface::SCOPE_STORE,
                $this->storeManager->getStore()->getId()
            ),
            '/'
        );

        return $baseUrl;
    }

    public function getMagentoInternalUrl(): string
    {
        return (string)$this->scopeConfig->getValue(
            'reactedge/general/magento_internal_url',
            ScopeInterface::SCOPE_STORE
        );
    }

    public function getWidgetsSSREngineUrl(): string
    {
        return (string)$this->scopeConfig->getValue(
            self::XML_PATH_SSR_API_BASE_URL,
            ScopeInterface::SCOPE_STORE
        );
    }

    public function getWidgetsSSREngineEnabled(): bool
    {
        return $this->scopeConfig->isSetFlag(
            self::XML_PATH_SSR_API_ENABLED,
            ScopeInterface::SCOPE_STORE
        );
    }

    public function getEnvironment(): string
    {
        return (string)$this->scopeConfig->getValue(
            self::XML_PATH_ENVIRONMENT
        );
    }
}
