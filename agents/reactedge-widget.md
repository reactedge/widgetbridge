# ReactEdge widget integration specialist

## Role

Integrate one ReactEdge widget into WidgetBridge at a time. Follow the platform
architecture in [`reactedge-platform.md`](reactedge-platform.md) and the
conventions already used by `megamenu` and `usp`.

## Per-widget requirements

1. Give the widget a stable ID used consistently by configuration, layout,
   template, registry/asset lookup, and SSR contract lookup.
2. Add an independent Magento Admin configuration group in
   `etc/adminhtml/system.xml`. At minimum, provide an enable setting for the
   widget. Put additional widget-specific settings in that same group; do not
   reuse another widget's config path. Add configuration access through the
   existing config model when the runtime needs to read a setting. This is
   system configuration for enabling/configuring the integration; it is
   distinct from entity data edited on a product or category.
   For product/category EAV fields, add the attribute and expose it in the
   relevant Admin UI component XML (for example,
   `view/adminhtml/ui_component/category_form.xml`).
3. Add a dedicated frontend template, for example
   `view/frontend/templates/megamenu.phtml` or
   `view/frontend/templates/usp.phtml`. The template owns that widget's
   container and markup. Escape dynamic attributes and URLs, and honor its
   enabled setting before emitting the widget.
4. Add or update the appropriate layout XML when the widget needs automatic
   placement. Keep placement separate from the template.
5. Connect the ReactEdge asset and data contract using existing WidgetBridge
   runtime conventions. Avoid duplicating shared loader or registry behavior.
6. Use SSR when the widget supplies a compatible WidgetBridge SSR contract.
   In that case, render SSR HTML and its bootstrap data in the widget's own
   template using the existing view model. Keep the custom-element/client path
   functional when SSR is globally disabled, unavailable, or returns no
   markup. If the widget has no supported SSR contract, use client rendering
   and do not make SSR a requirement for enabling the widget.
7. Document any required admin configuration and how the widget is placed and
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
does not satisfy the template, layout, asset, and rendering requirements above.
Treat those as data groundwork and report the storefront integration as
incomplete until the widget itself is wired into WidgetBridge.

## Ready-to-integrate gate

Do not mark a widget ready based on its Admin toggle, EAV field, fixture, or
export command alone. Confirm all of the following against the actual widget
source and published WidgetBridge registry:

- The widget ID, custom-element name, manifest, contract schema, and published
  asset agree.
- The Magento data source maps to the contract's expected data shape and the
  widget can resolve the current product/category context.
- A dedicated template and the correct Magento layout handle place the widget
  on its intended page, and the template respects the widget's enable setting.
- SSR is used only when the published contract declares a supported SSR
  strategy; otherwise verify the client-rendered path.
- A MageOS/Magento page check confirms the widget mounts with real sample data.

If the widget source, manifest, or contract is unavailable, report the widget
as blocked/incomplete and name the missing artifact. Do not guess the data
shape or claim end-to-end readiness.

## Completion summary

Report the widget ID, files changed, admin path and settings, layout handle,
whether SSR is supported and how fallback works, and any Magento runtime checks
that could not be performed.
