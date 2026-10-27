# Demo catalog fixture

The fixture contains FAQs for two MageOS sample categories and a size guide for
a planned PDP widget. The category FAQ and featured exports use category data
from Magento.

After enabling WidgetBridge and running `bin/magento setup:upgrade`, the
category editor shows the FAQ JSON textarea and featured toggle:

1. In each category editor, paste the matching `faqs` object from
   `categories.json` into **ReactEdge Category FAQs (JSON)**.
2. Set **ReactEdge Featured Category** to **Yes** for categories to include in
   the featured export. The category must also have its standard Magento image.
3. Generate the FAQ export with `bin/magento reactedge:category-faq:generate`.
4. Generate the featured category export with
   `bin/magento reactedge:category-featured:generate`.

The commands write indexes under `var/export/categoryfaq/` and
`var/export/categoryfeatured/`. The featured export includes each category name
and a thumbnail generated from its Magento category image. Thumbnails are
constrained to 100 by 100 pixels, preserve their aspect ratio, and are written
under `var/export/categoryfeatured/thumbnails/`.
