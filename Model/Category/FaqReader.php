<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Category;

use Magento\Catalog\Model\ResourceModel\Category\Collection;
use Magento\Catalog\Model\ResourceModel\Category\CollectionFactory;
use Magento\Store\Model\StoreManagerInterface;

class FaqReader
{
    public function __construct(
        private readonly CollectionFactory $categoryCollectionFactory,
        private readonly StoreManagerInterface $storeManager
    ) {
    }

    public function getCategoriesWithFaq(): Collection
    {
        $store = $this->storeManager->getStore();
        $collection = $this->categoryCollectionFactory->create();
        $collection->setStoreId((int) $store->getId());
        $collection->addAttributeToSelect(['name', 'url_key', 'reactedge_faq']);
        $collection->addAttributeToFilter('reactedge_faq', ['neq' => '']);
        $collection->addIsActiveFilter();
        $collection->addFieldToFilter(
            'path',
            ['like' => '1/' . $store->getRootCategoryId() . '/%']
        );

        return $collection;
    }
}
