<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer;

use Magento\Framework\App\CacheInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Filesystem\Driver\File as FileDriver;
use Magento\Store\Model\StoreManagerInterface;
use ReactEdge\WidgetBridge\Model\Cache;

class SsrAssetReader
{
    private const CACHE_LIFETIME = 86400;

    public function __construct(
        private StoreManagerInterface $storeManager,
        private FileDriver            $fileDriver,
        private CacheInterface $cache
    ) {
    }

    public function getSsr(string $widget, string $variant): string
    {
        $relativePath = sprintf(
            'ssr/%s/output.html',
            $widget
        );

        $cached = $this->loadCache($relativePath);

        if ($cached !== null) {
            return $cached;
        }

        try {
            $contents = $this->readSsrAssetContent($relativePath);
        } catch (\Throwable $exception) {
            // logger if available
            return '';
        }

        $this->saveCache($relativePath, $contents);

        return $contents;
    }

    private function loadCache(string $assetPath): ?string
    {
        $cached = $this->cache->load(
            $this->generateCacheKey($assetPath)
        );

        return $cached !== false ? $cached : null;
    }

    private function saveCache(
        string $assetPath,
        string $contents
    ): void {
        $this->cache->save(
            $contents,
            $this->generateCacheKey($assetPath),
            [Cache::CACHE_TAG],
            self::CACHE_LIFETIME
        );
    }

    private function generateCacheKey(string $assetPath): string
    {
        return sprintf(
            'reactedge_ssr_%s',
            hash(
                'sha256',
                sprintf(
                    '%s:%s',
                    $this->storeManager->getStore()->getCode(),
                    $assetPath
                )
            )
        );
    }

    public function readSsrAssetContent(string $relativePath)
    {
        $fullPath = sprintf(
            '%s/%s/%s',
            $this->getReactEdgeRoot(),
            $this->storeManager->getStore()->getCode(),
            $relativePath
        );

        if (!$this->fileDriver->isExists($fullPath)) {
            throw new LocalizedException(
                __('File path not found: %1', $fullPath)
            );
        }

        return $this->fileDriver->fileGetContents($fullPath);
    }

    private function getReactEdgeRoot(): string
    {
        return dirname(BP) . '/reactedge';
    }
}
