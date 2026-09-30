<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Megamenu;

use Magento\Catalog\Model\ResourceModel\Category\StateDependentCollectionFactory;
use Magento\Framework\Data\Collection;
use Magento\Store\Model\StoreManagerInterface;

class TreeData
{

    private StateDependentCollectionFactory $categoryCollectionFactory;

    public function __construct(
        private StoreManagerInterface       $storeManager,
        StateDependentCollectionFactory $categoryCollectionFactory
    ) {
        $this->categoryCollectionFactory = $categoryCollectionFactory;
    }

    public function buildTree(): array
    {
        $storeId = $this->storeManager->getStore()->getId();
        $rootId = $this->storeManager->getStore()->getRootCategoryId();

        $collection = $this->getCategoryTree($storeId, $rootId);

        // Build parent index
        $byParent = [];

        foreach ($collection as $category) {
            $byParent[$category->getParentId()][] = $category;
        }

        $items = [];

        // Start ONLY from root children
        foreach ($byParent[$rootId] ?? [] as $category) {
            $node = $this->buildNode($category, $byParent);

            if ($node) {
                $items[] = $node;
            }
        }

        return ['items' => $items];
    }

    private function buildNode($category, $byParent): ?array
    {
        $children = [];

        foreach ($byParent[$category->getId()] ?? [] as $child) {
            $node = $this->buildNode($child, $byParent);
            if ($node) {
                $children[] = $node;
            }
        }

        return [
            'id' => (string)$category->getId(),
            'label' => $category->getName(),
            'url' => $category->getUrl(),
            'image' => $this->resolveImage($category),
            'children' => $children
        ];
    }

    private function getCategoryTree($storeId, $rootId)
    {
        /** @var \Magento\Catalog\Model\ResourceModel\Category\Collection $collection */
        $collection = $this->categoryCollectionFactory->create();
        $collection->setStoreId($storeId);
        $collection->addAttributeToSelect(['name', 'image']);
        $collection->addFieldToFilter('path', ['like' => '1/' . $rootId . '/%']); //load only from store root
        $collection->addAttributeToFilter('include_in_menu', 1);
        $collection->addIsActiveFilter();
        $collection->addNavigationMaxDepthFilter();
        $collection->addUrlRewriteToResult();
        $collection->addOrder('level', Collection::SORT_ORDER_ASC);
        $collection->addOrder('position', Collection::SORT_ORDER_ASC);
        $collection->addOrder('parent_id', Collection::SORT_ORDER_ASC);
        $collection->addOrder('entity_id', Collection::SORT_ORDER_ASC);

        return $collection;
    }
    private function resolveImage($category): ?string
    {
        if ($category->getImage()) {
            return $this->buildImageUrl($category->getImage());
        }

        return null;
    }

    private function buildImageUrl(?string $image): ?string
    {
        if (!$image) {
            return null;
        }

        return $this->storeManager->getStore()->getBaseUrl() . ltrim($image, '/');
    }
}
