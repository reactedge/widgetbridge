# Demo catalog fixture

The fixture contains FAQ content for two MageOS sample categories and a separate
product size guide for the planned PDP size guide widget. The category FAQ
generator exports only the category FAQ values. The category FAQs are entered
into the `ReactEdge Category FAQs (JSON)` category attribute created by
WidgetBridge. In the category editor, paste each matching `faqs` object from
`categories.json` into that category's field.

From the Magento root, generate the Category FAQ export with:

```bash
bin/magento reactedge:category-faq:generate
```

The command writes an index to `var/export/categoryfaq/categories.json` and one
JSON file per category to `var/export/categoryfaq/categories/`. Active categories
with FAQ data are included. Featured category data will be added separately.
