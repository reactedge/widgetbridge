<?php

declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Observability;

use ReactEdge\WidgetBridge\Model\Config\CategoryReader;
use ReactEdge\WidgetBridge\Model\Config\ProductReader;

final readonly class Context
{
    public function __construct(
        private CategoryReader $categoryReader,
        private ProductReader $productReader
    ) {
    }

    public function getEntityId(): string
    {
        if ($this->getSku() !== null) {
            return $this->getSku();
        }

        if ($this->getCategory() !== null) {
            return $this->getCategory();
        }

        return 'page';
    }

    public function getSku(): ?string
    {
        return $this->productReader->getCurrentProductSku();
    }

    public function getCategory(): ?string
    {
        return $this->categoryReader->getCurrentCategoryUrlKey();
    }
}
