# ReactEdge WidgetBridge

Bridge Magento and Mage-OS with high-performance ReactEdge widgets.

WidgetBridge enables ReactEdge widgets to integrate seamlessly into Magento and Mage-OS storefronts while preserving the native platform.

Rather than replacing the storefront with a fully headless architecture, WidgetBridge allows individual frontend capabilities to evolve independently using server-side rendered React widgets.

## Features

- Server-side rendered widgets
- Progressive hydration
- Widget contracts
- Asset management
- Runtime widget registry
- Incremental frontend modernisation
- Magento-native integration
- Mage-OS compatible

## Why?

Many commerce teams want the performance and developer experience of modern frontend technologies without rewriting their entire storefront.

WidgetBridge enables an incremental approach by allowing individual frontend features to be delivered as independent React widgets.

Typical use cases include:

- Navigation
- Product galleries
- Promotional banners
- Mini cart
- Search
- Recommendations
- Future AI-powered experiences

## Installation

Install using Composer:

```bash
composer require reactedge/widgetbridge
```

Enable the module:

```bash
bin/magento module:enable ReactEdge_WidgetBridge
bin/magento setup:upgrade
bin/magento cache:flush
```

### Enable SSR

```bash
bin/magento config:set reactedge/widgets_ssr/enabled 1
bin/magento config:set reactedge/widgets_ssr/base_url https://ssr-origin.reactedge.net
```

### Enable Observability
```bash
bin/magento config:set reactedge/observability/enabled 1
bin/magento config:set reactedge/observability/service_name reactedge-mageos-dev
bin/magento config:set reactedge/observability/collector_endpoint https://otel.reactedge.net/v1/traces
```

## Philosophy

WidgetBridge is based on a few core principles:

- Keep Magento.
- Modernise incrementally.
- Prefer open standards.
- Keep widgets independent.
- Minimise coupling.
- Optimise for performance.

## Architecture

```
Magento / Mage-OS
        │
        ▼
WidgetBridge
        │
        ▼
ReactEdge Widgets
        │
        ▼
SSR + Hydration
```

## Compatibility

- Magento 2
- Mage-OS
- PHP 8.1+
- ReactEdge widgets

## Roadmap

- Additional widget types
- Improved SSR caching
- AI-assisted widget generation
- Extended observability
- Framework integrations

## Contributing

Contributions, ideas and feedback are welcome.

Please open an issue before submitting significant changes.

## License

MIT
