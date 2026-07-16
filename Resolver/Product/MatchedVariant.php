<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Resolver\Product;

use Magento\Framework\GraphQl\Query\ResolverInterface;
use ReactEdge\WidgetBridge\Model\Product\VariantResolver;

class MatchedVariant implements ResolverInterface
{
    private $variantResolver;

    /**
     * @param VariantResolver $variantResolver
     */
    public function __construct(VariantResolver $variantResolver)
    {
        $this->variantResolver = $variantResolver;
    }

    public function resolve($field, $context, $info, $value = null, $args = null)
    {
        if (!isset($value['model'])) {
            return null;
        }

        $filters = $info->variableValues['filter'] ?? [];

        $colors =
            $filters['color']['in']
            ?? (isset($filters['color']['eq']) ? [$filters['color']['eq']] : []);

        if (empty($colors)) {
            return null;
        }

        return [
            'url' => $this->variantResolver->resolve($value['model'], $colors)
        ];
    }
}
