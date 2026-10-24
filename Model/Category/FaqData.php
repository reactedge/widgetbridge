<?php
declare(strict_types=1);

namespace ReactEdge\WidgetBridge\Model\Category;

use Magento\Catalog\Model\Category;
use Magento\Framework\Serialize\SerializerInterface;

class FaqData
{
    public function __construct(
        private readonly SerializerInterface $serializer
    ) {
    }

    public function export(Category $category): array
    {
        $value = trim((string) $category->getData('reactedge_faq'));

        if ($value === '') {
            return ['items' => []];
        }

        $data = $this->serializer->unserialize($value);

        if (!is_array($data) || !isset($data['items']) || !is_array($data['items'])) {
            throw new \UnexpectedValueException(
                sprintf('Category %s has invalid FAQ JSON.', $category->getUrlKey())
            );
        }

        foreach ($data['items'] as $item) {
            if (!$this->isValidFaqItem($item)) {
                throw new \UnexpectedValueException(
                    sprintf('Category %s has an invalid FAQ item.', $category->getUrlKey())
                );
            }
        }

        return ['items' => array_values($data['items'])];
    }

    private function isValidFaqItem(mixed $item): bool
    {
        return is_array($item)
            && isset($item['question'], $item['answer'])
            && is_string($item['question'])
            && is_string($item['answer'])
            && trim($item['question']) !== ''
            && trim($item['answer']) !== '';
    }
}
