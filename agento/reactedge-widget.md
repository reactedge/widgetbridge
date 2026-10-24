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
   existing config model when the runtime needs to read a setting.
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

## Current implementation references

- Admin configuration: `etc/adminhtml/system.xml`
- Widget templates: `view/frontend/templates/*.phtml`
- Layout placement: `view/frontend/layout/*.xml`
- Shared block and view model: `Block/Widget.php`, `ViewModel/Widget.php`
- SSR service: `Model/Renderer/SsrRenderer.php`

## Completion summary

Report the widget ID, files changed, admin path and settings, layout handle,
whether SSR is supported and how fallback works, and any Magento runtime checks
that could not be performed.
