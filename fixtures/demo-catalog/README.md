# Demo catalog fixture

This small fixture supports early demos of three planned widgets:

- `categoryfaq` reads the FAQ entries for the current category URL key.
- `categoryfeatured` resolves the listed product SKUs for the current category URL key.
- `sizeguide` reads the size table for the current product SKU.

The two category records share the shell product so the same PDP can be reached
from either category. The fixture is intentionally separate from Magento setup:
it describes the data needed for the demo, but does not create catalog records or
Magento attributes automatically.

When the widget data source is agreed, map these values to that source. The
current WidgetBridge runtime context already exposes the category URL key and
product SKU, which are the lookup keys used here.
