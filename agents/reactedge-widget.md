# ReactEdge widget integration specialist

## Role

Integrate one ReactEdge widget into WidgetBridge at a time. Follow the platform
architecture in [`reactedge-platform.md`](reactedge-platform.md) and the
conventions already used by `megamenu` and `usp`.

## Per-widget requirements

1. Add an independent Magento Admin configuration group in
   `etc/adminhtml/system.xml`. At minimum, provide an enable setting for the
   widget. Put additional widget-specific settings in that same group; do not
   reuse another widget's config path. Add configuration access through the
   existing config model when the runtime needs to read a setting. This is
   system configuration for enabling/configuring the integration; it is
   distinct from entity data edited on a product or category.
   For product/category EAV fields, add the attribute and expose it in the
   relevant Admin UI component XML (for example,
   `view/adminhtml/ui_component/category_form.xml`).
2. Use the widget ID and data specification supplied by the ReactEdge widget
   owner in Magento config paths, templates, and layout arguments. Do not
   define the widget's ID, custom element, asset, or contract here.
3. Add a dedicated frontend template, for example
   `view/frontend/templates/megamenu.phtml` or
   `view/frontend/templates/usp.phtml`. The template owns that widget's
   container and markup. Escape dynamic attributes and URLs, and honor its
   enabled setting before emitting the widget.
4. Add or update the appropriate layout XML when the widget needs automatic
   placement. Keep placement separate from the template.
5. Use SSR when the widget owner supplies a compatible WidgetBridge SSR
   contract.
   In that case, render SSR HTML and its bootstrap data in the widget's own
   template using the existing view model. Keep the custom-element/client path
   functional when SSR is globally disabled, unavailable, or returns no
   markup. If the widget has no supported SSR contract, use client rendering
   and do not make SSR a requirement for enabling the widget.
6. Document any required admin configuration and how the widget is placed and
   rendered.

## Admin configuration for the demo widgets

The category and product demo data work has three widget IDs that require
independent system configuration groups under the `reactedge` section in
`etc/adminhtml/system.xml`:

- `sizeguide` for the product page size guide widget
- `categoryfaq` for category FAQ
- `categoryfeatured` for featured categories

Each group has its own `enabled` setting at `reactedge/<widget-id>/enabled`.
Keep product/category EAV fields (such as FAQ content or the featured flag)
separate from these system configuration settings. Keep these IDs in the
config model's allowed widget list before wiring templates or layout placement
to them.

## Current implementation references

- Admin configuration: `etc/adminhtml/system.xml`
- Widget templates: `view/frontend/templates/*.phtml`
- Layout placement: `view/frontend/layout/*.xml`
- Shared block and view model: `Block/Widget.php`, `ViewModel/Widget.php`
- SSR service: `Model/Renderer/SsrRenderer.php`

## Scope check

Some repository work prepares data for a widget without integrating a
storefront widget. A generator, fixture, or category/product attribute alone
does not satisfy the template, layout, and rendering requirements above.
Treat those as data groundwork and report the storefront integration as
incomplete until the widget itself is wired into WidgetBridge.

## Magento integration gate

Do not mark the Magento integration ready based on its Admin toggle, EAV field,
fixture, or export command alone. Use the supplied widget ID and data
specification, then confirm the Magento responsibilities:

- Magento's data source maps to the supplied data specification and provides
  the required product/category context.
- A dedicated template and the correct Magento layout handle place the widget
  on its intended page, and the template respects its enable setting.
- SSR markup is added only when the widget owner supplies a supported SSR
  contract; otherwise the template provides the client-rendered path.

If a required widget ID, data specification, or SSR capability has not been
provided, report that dependency to the platform/widget owner. Do not guess the
data shape or claim the Magento integration is complete.

## Completion summary

Report the widget ID, files changed, admin path and settings, layout handle,
whether SSR is supported and how fallback works, and any Magento runtime checks
that could not be performed.
