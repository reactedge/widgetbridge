# WidgetBridge agents

This folder defines the project-level ReactEdge platform agent and the focused
agent for integrating ReactEdge widgets into WidgetBridge.

- [`reactedge-platform.md`](reactedge-platform.md) is the top-level agent. It
  owns platform architecture and delegates widget integrations to the specialist.
- [`reactedge-widget.md`](reactedge-widget.md) is the widget integration
  specialist. Use it for adding or changing an individual widget.

The widget specialist's default checklist is one Magento admin configuration
group per widget, one frontend template per widget, a layout entry when the
widget needs placement, and SSR markup/bootstrap only when that ReactEdge widget
supports the WidgetBridge SSR contract.
