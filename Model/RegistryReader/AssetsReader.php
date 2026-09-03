<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\RegistryReader;

use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Filesystem\Driver\File as FileDriver;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\Serialize\SerializerInterface;
use Psr\Log\LoggerInterface;
use ReactEdge\WidgetBridge\Model\Config;

class AssetsReader
{
    public function __construct(
        private StoreManagerInterface $storeManager,
        private SerializerInterface   $serializer,
        private FileDriver            $fileDriver,
        private AssetsCacheHandler $assetsCacheHandler,
        private readonly Config $config,
        private LoggerInterface $logger
    ) {
    }

    public function getRegistry(): array
    {
        $relativePath = 'registry.json';

        $cached =
            $this->assetsCacheHandler->loadCache(
                $relativePath
            );

        if (!empty($cached)) {
            return $cached;
        }

        $path = sprintf(
            '%s/%s',
            $this->getReactEdgeRoot(),
            $relativePath
        );

        try {
            $contents = $this->getJsonFileContent(
                $path
            );
        } catch (\Throwable $exception) {
            $this->logger->error("Error reading registry " . $exception->getMessage());
            $contents = [];
        }

        $this->assetsCacheHandler->saveCache(
            $relativePath,
            $contents
        );

        return $contents;
    }

    public function getContract(
        string $widget
    ): array {
        $relativePath = sprintf('manifests/%s.json', $widget);

        $cached =
            $this->assetsCacheHandler->loadCache(
                $relativePath
            );

        if (!empty($cached)) {
            return $cached;
        }

        $storeCode = $this->storeManager
            ->getStore()
            ->getCode();

        $path = sprintf(
            '%s/%s/%s',
            $this->getReactEdgeRoot(),
            $storeCode,
            $relativePath
        );

        try {
            $contents = $this->getJsonFileContent(
                $path
            );
        } catch (\Throwable $exception) {
            $this->logger->error("Error reading contrat " .$widget . " error:". $exception->getMessage());
            $contents = [];
        }

        $this->assetsCacheHandler->saveCache(
            $relativePath,
            $contents
        );

        return $contents;
    }

    private function getJsonFileContent($path): array
    {
        if (!$this->fileDriver->isExists($path)) {
            throw new LocalizedException(
                __('File Path not found.' . $path)
            );
        }

        $contents = $this->fileDriver->fileGetContents(
            $path
        );

        if ($contents === false) {
            throw new LocalizedException(
                __('Unable to read file.' . $path)
            );
        }

        $manifest =
            $this->serializer->unserialize($contents);

        return $manifest;
    }

    public function getReactEdgeDebugDirectory()
    {
        $path = sprintf(
            '%s/%s',
            $this->getReactEdgeRoot(),
            'debug'
        );
        return $path;
    }

    private function getReactEdgeRoot(): string
    {
        return dirname(BP) . '/reactedge';
    }

    public function readPublishedAsset(string $fileName)
    {
        $url = $this->storeManager
            ->getStore()
            ->getBaseUrl(
                \Magento\Framework\UrlInterface::URL_TYPE_WEB
            );

        $url .= 'reactedge/' . $fileName;

        return $url;
    }

    public function readFileAssetContent(string $widgetId, string $fileName)
    {
        $fullPath = $this->getReactEdgeRoot()
            . '/release/source/'
            . $widgetId . '/'
            . $fileName;

        if (!$this->fileDriver->isExists($fullPath)) {
            throw new LocalizedException(
                __('File path not found: %1', $fullPath)
            );
        }

        return $this->fileDriver->fileGetContents($fullPath);
    }
}
