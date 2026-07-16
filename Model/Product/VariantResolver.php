<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Product;

use Magento\Catalog\Api\ProductRepositoryInterface;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;

class VariantResolver
{
    private ProductRepositoryInterface $productRepository;
    private StoreManagerInterface $storeManager;

    public function __construct(
        ProductRepositoryInterface $productRepository,
        StoreManagerInterface $storeManager

    ) {
        $this->productRepository = $productRepository;
        $this->storeManager = $storeManager;
    }

    public function resolve($product, array $colors)
    {
        $children = $product
            ->getTypeInstance()
            ->getUsedProducts($product);

        foreach ($children as $child) {
            if (in_array($child->getData('color'), $colors)) {
                $imagePath = $child->getData('small_image');

                if (!$imagePath) {
                    return null;
                }

                return $this->storeManager
                        ->getStore()
                        ->getBaseUrl(\Magento\Framework\UrlInterface::URL_TYPE_MEDIA)
                    . 'catalog/product'
                    . $imagePath;
            }
        }

        return null;
    }

    private function loadProduct(int $productId)
    {
        return $this->productRepository->getById($productId);
    }
}
