<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Config;

use Magento\Catalog\Model\Product;
use Magento\Framework\Registry;

class ProductReader
{
    public function __construct(
        private readonly Registry $registry
    ) {
    }

    public function getCurrentProduct(): ?Product
    {
        $product = $this->registry->registry('current_product');

        return $product instanceof Product
            ? $product
            : null;
    }

    public function getCurrentProductSku(): ?string
    {
        return $this->getCurrentProduct()?->getSku();
    }

    public function getCurrentProductUrlKey(): ?string
    {
        return $this->getCurrentProduct()?->getUrlKey();
    }
}
