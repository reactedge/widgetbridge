<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Category;

use Magento\Catalog\Model\Category;

class FeaturedData
{
    public function __construct(
        private readonly ThumbnailGenerator $thumbnailGenerator
    ) {
    }

    public function export(Category $category): array
    {
        $thumbnail = $this->thumbnailGenerator->generate($category);

        if ($thumbnail === null) {
            throw new \RuntimeException(
                sprintf('Featured category %s has no image.', $category->getUrlKey())
            );
        }

        return [
            'name' => (string) $category->getName(),
            'thumbnail' => $thumbnail,
        ];
    }
}
