<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Megamenu;

class MenuData
{
    public const MENU_ID = 'megamenu';

    public function __construct(
        private TreeData $treeData
    ) {}

    public function getMegamenuData(): array
    {
        // expensive computation
        $data = $this->treeData->buildTree();

        return $data;
    }
}
