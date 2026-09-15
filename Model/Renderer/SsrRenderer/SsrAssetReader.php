<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Renderer\SsrRenderer;

use Magento\Framework\App\CacheInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Filesystem\Driver\File as FileDriver;
use Magento\Store\Model\StoreManagerInterface;
use ReactEdge\WidgetBridge\Api\ActivityInterface;
use ReactEdge\WidgetBridge\Api\OperationInterface;
use ReactEdge\WidgetBridge\Model\Cache;

class SsrAssetReader
{
    private const CACHE_LIFETIME = 86400;

    public function __construct(
        private StoreManagerInterface $storeManager,
        private FileDriver            $fileDriver,
        private CacheInterface $cache,
        private ActivityInterface $activity,
        private SsrSnapshotStorage $snapshotStorage
    ) {
    }

    public function getSsr(string $widget, string $output, string $variant, OperationInterface $operation): string
    {
        $ssrReading = $this->activity->startChildOperation(
            $operation,
            'ssr.reading.asset',
            [
                'widget.id' => $widget
            ]
        );

        $relativePath = sprintf(
            'ssr/%s/%s',
            $widget,
            $output
        );

        $cached = $this->loadCache($relativePath);

        if ($cached !== null) {
            $this->activity->endOperation(
                $ssrReading,
                [
                    'success' => 'File read from cache',
                    'relativePath' => $relativePath
                ]
            );
            return $cached;
        }

        try {
            $contents = $this->readSsrAssetContent($relativePath);
        } catch (\Throwable $exception) {
            $this->activity->endOperation(
                $ssrReading,
                [
                    'error' => 'File not found',
                    'relativePath' => $relativePath,
                    'message' => $exception->getMessage()
                ]
            );
            return '';
        }

        $this->saveCache($relativePath, $contents);

        $this->snapshotStorage->save(
            $ssrReading->getId(),
            $contents
        );

        $this->activity->addEvent(
            $ssrReading,
            'SSR Static Render Completed',
            [
                'ssr.length' => strlen($contents),
                'ssr.hash' => md5($contents),
                'snapshot.saved' => $ssrReading->getId() . '.html',
            ]
        );

        $this->activity->endOperation(
            $ssrReading,
            [
                'success' => 'File successfully read & cached',
                'relativePath' => $relativePath,
                'snapshot.id' => $ssrReading->getId(),
            ]
        );

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
