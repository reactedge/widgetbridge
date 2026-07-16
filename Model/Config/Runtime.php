<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Config;

use Magento\Framework\Serialize\SerializerInterface;
use Magento\Store\Model\StoreManagerInterface;

use ReactEdge\WidgetBridge\Model\Config;

class Runtime
{
    public function __construct(
        private Config                $config,
        private StoreManagerInterface $storeManager,
        private CategoryReader        $categoryReader
    ) {}

    public function getRuntimeConfig(): array
    {
        $data = [
            'integrations' => [
                'googleMaps' => [
                    "apiKey" => $this->getGoogleApiKey(),
                    "placeId" => $this->getGooglePlaceId(),
                ],
                "magentoGraphql" => $this->getGraphqlConfig(),
                "intentApi" => [
                    "baseUrl" => $this->config->getIntentApiBaseUrl()
                ]
            ],
            'storeCode' => $this->storeManager->getStore()->getCode(),
            'category' => $this->categoryReader->getCurrentCategoryUrlKey()
        ];

        return $data;
    }

    public function getGoogleApiKey()
    {
        return $this->config->getGoogleMapsApiKey();
    }

    public function getGooglePlaceId()
    {
        return $this->config->getGooglePlaceId();
    }

    public function getBaseUrl()
    {
        return $this->config->getBaseUrl();
    }

    public function getMagentoInternalUrl()
    {
        return $this->config->getMagentoInternalUrl();
    }

    private function getGraphqlConfig(): array
    {
        $graphqlConfig = [
            'api' => "{$this->getBaseUrl()}/graphql",
        ];

        if ($internalUrl = $this->getMagentoInternalUrl()) {
            $graphqlConfig['internalApi'] = "{$internalUrl}/graphql";
        }

        return  $graphqlConfig;
    }
}
