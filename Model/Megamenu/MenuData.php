<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Megamenu;

class MenuData
{
    public const MENU_ID = 'megamenu';

    private $menuData = null;

    public function __construct(
        private TreeData $treeData
    ) {}

    public function getMegamenuData(): array
    {
        if (is_null($this->menuData)) {
            // expensive computation
            $data = $this->treeData->buildTree();

            $this->menuData = $data ?? [];
        }

        return $this->menuData;
    }
}
