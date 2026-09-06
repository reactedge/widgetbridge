<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Resolver\Product;

use Magento\Framework\GraphQl\Query\ResolverInterface;

use Magento\ConfigurableProduct\Model\Product\Type\Configurable;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;

class GalleryByAttribute implements ResolverInterface
{
    private Configurable $configurableType;

    public function __construct(
        Configurable $configurableType
    )
    {
        $this->configurableType = $configurableType;
    }

    public function resolve(
        Field       $field,
                    $context,
        ResolveInfo $info,
        ?array      $value = null,
        ?array      $args = null
    ) {
        if (!isset($value['model'])) {
            return [];
        }

        /** @var \Magento\Catalog\Model\Product $product */
        $product = $value['model'];

        $attributeCode = $args['code'];
        $attributeValue = $args['value'];

        $children = $this->configurableType->getUsedProducts($product);

        foreach ($children as $child) {
            if ((string)$child->getData($attributeCode) !== $attributeValue) {
                continue;
            }

            $entries = $child->getMediaGalleryEntries();

            if (!$entries) {
                continue;
            }

            $image = $entries[0];

            return [[
                ...$image->getData(),
                'model' => $child,
            ]];
        }

        return [];
    }
}
