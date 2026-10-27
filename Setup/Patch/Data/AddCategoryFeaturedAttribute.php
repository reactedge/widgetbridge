<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Setup\Patch\Data;

use Magento\Catalog\Model\Category;
use Magento\Catalog\Setup\CategorySetupFactory;
use Magento\Eav\Model\Entity\Attribute\ScopedAttributeInterface;
use Magento\Eav\Model\Entity\Attribute\Source\Boolean;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Framework\Setup\Patch\DataPatchInterface;

class AddCategoryFeaturedAttribute implements DataPatchInterface
{
    public function __construct(
        private readonly ModuleDataSetupInterface $moduleDataSetup,
        private readonly CategorySetupFactory $categorySetupFactory
    ) {
    }

    public function apply(): self
    {
        $this->moduleDataSetup->getConnection()->startSetup();
        $categorySetup = $this->categorySetupFactory->create([
            'setup' => $this->moduleDataSetup,
        ]);
        $categorySetup->addAttribute(
            Category::ENTITY,
            'reactedge_is_featured',
            [
                'type' => 'int',
                'label' => 'ReactEdge Featured Category',
                'input' => 'select',
                'source' => Boolean::class,
                'default' => 0,
                'required' => false,
                'sort_order' => 91,
                'global' => ScopedAttributeInterface::SCOPE_STORE,
                'visible' => true,
                'user_defined' => true,
                'group' => 'General Information',
            ]
        );
        $this->moduleDataSetup->getConnection()->endSetup();

        return $this;
    }

    public static function getDependencies(): array
    {
        return [];
    }

    public function getAliases(): array
    {
        return [];
    }
}
