<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model;

use Psr\Log\LoggerInterface;
use ReactEdge\WidgetBridge\Model\Megamenu\MenuData;
use ReactEdge\WidgetBridge\Model\RegistryReader\AssetsReader;
use ReactEdge\WidgetBridge\Model\RegistryReader\WidgetAssetResolver;

class RegistryReader
{
    private $activeInstances = null;

    public  function __construct(
        private MenuData        $menuData,
        private AssetsReader    $assetsReader,
        private WidgetAssetResolver $widgetAssetResolver,
        private LoggerInterface $logger
    ) {
    }

    /**
     * Loads every active widget contract from the registry and enriches
     * contracts requiring runtime-generated data (e.g. megamenu).
     */
    public function getWidgetsContract(): array {
        $registry = [];

        try {
            $widgets = $this->getActiveWidgetInstances();

            foreach ($widgets as $widgetInstanceId => $widgetInstanceData) {
                try {
                    $contract = $this->assetsReader->getContract($widgetInstanceId);

                    if ($contract) {
                        $json = $this->normalizeContract($contract);
                        $json = $this->widgetAssetResolver->resolve($json);
                        $registry[$widgetInstanceId] = $this->addDynamicWidgetData($json);
                    }

                } catch (\Exception $e) {
                    $this->logger->error("Error loading manifest $widgetInstanceId: " . $e->getMessage());
                }
            }
        } catch (\Exception $e) {
            $this->logger->error("Error loading manifest $widgetInstanceId: " . $e->getMessage());
        }

        ksort($registry);
        return $registry;
    }

    public function getWidgetContract(string $widgetId): array
    {
        try {
            $widgets = $this->getActiveWidgetInstances();
            if (!isset($widgets[$widgetId])) {
                return [];
            }

            $contract = $this->assetsReader->getContract($widgetId);

            if (!$contract) {
                return [];
            }

            $json = $this->normalizeContract($contract);
            $json = $this->widgetAssetResolver->resolve($json);

        } catch (\Exception $e) {
            $this->logger->error("Error loading contract $widgetId: " . $e->getMessage());
            return [];
        }

        return $this->addDynamicWidgetData($json);
    }

    private function normalizeContract(array $data): array
    {
        if (
            isset($data['contract']['translations'])
            && $data['contract']['translations'] === []
        ) {
            $data['contract']['translations'] = new \stdClass();
        }

        return $data;
    }

    private function addDynamicWidgetData(array $data): array
    {

        if (isset($data['id']) && $data['id'] === MenuData::MENU_ID) {
            $menuData = $this->menuData->getMegamenuData();
            $data['contract']['data'] = $menuData;
        }

        return $data;
    }

    public function getMainActiveWidgets(): array
    {
        $activeWidgets = [];

        $widgets = $this->getActiveWidgetInstances();

        foreach ($widgets as $widgetInstanceId => $widgetInstance) {
            if (isset($widgetInstance['widget'])) continue;

            $activeWidgets[$widgetInstanceId] = $widgetInstanceId;
        }

        return $activeWidgets;
    }

    private function getActiveWidgetInstances(): array
    {
        if ($this->activeInstances === null) {
            $this->activeInstances = [];

            $widgets = $this->assetsReader->getRegistry();

            if (!$widgets) {
                $this->logger->error('ReactEdge manifest widgets.json not found');
                return [];
            }

            foreach ($widgets as $widgetInstanceId => $widgetInstance) {
                try {
                    if ($widgetInstance['active'] ?? false) {
                        $this->activeInstances[$widgetInstanceId] = $widgetInstance;
                    }

                } catch (\Exception $e) {
                    $this->logger->error("Error loading manifest $widgetInstanceId: " . $e->getMessage());
                }
            }
        }

        return $this->activeInstances;
    }

}
