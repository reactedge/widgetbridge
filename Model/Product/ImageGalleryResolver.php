<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Product;

use Magento\Catalog\Api\Data\ProductInterface;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;

class ImageGalleryResolver
{
    public function __construct(
        private readonly StoreManagerInterface $storeManager
    ) {
    }

    public function export(ProductInterface $product): array
    {
        $images = [];

        foreach ($product->getMediaGalleryEntries() ?? [] as $entry) {
            $images[] = [
                'src' => $this->getMediaUrl($entry->getFile()),
                'alt' => $entry->getLabel(),
                'role' => 'base'
            ];
        }

        return [
            'key' => $product->getSku(),
            'images' => $images,
        ];
    }


    private function getMediaUrl(string $imagePath)
    {
        return $this->storeManager
                ->getStore()
                ->getBaseUrl(UrlInterface::URL_TYPE_MEDIA)
            . 'catalog/product'
            . $imagePath;
    }
}
