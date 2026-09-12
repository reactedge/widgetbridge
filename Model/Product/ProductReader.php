<?php

declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Product;

use Magento\Catalog\Model\Product\Visibility;
use Magento\Catalog\Model\ResourceModel\Product\Collection;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;

class ProductReader
{
    public function __construct(
        private readonly CollectionFactory $productCollectionFactory,
        private readonly Visibility $productVisibility,
    ) {
    }

    public function getVisibleProducts(): Collection
    {
        $collection = $this->productCollectionFactory->create();

        $collection->addAttributeToSelect('sku');

        $collection->addAttributeToSelect([
            'sku',
            'media_gallery',
        ]);

        $collection->addAttributeToFilter(
            'visibility',
            ['in' => $this->productVisibility->getVisibleInSiteIds()]
        );

        return $collection;
    }
}
