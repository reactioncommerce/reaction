# Reaction Analytics

This package is currently working but buggy and feature incomplete. Pull requests to the development branch are appreciated.

This provides an analytics framework for integrating third-party analytics
services such as [segment.io](segment.io), [Google Analytics](google.com/analytics), and [Mixpanel](mixpanel.com).

This package will only send analytics libraries to the client that you have enabled, and it is easily extensible to add additional analytics libraries as you need.

Because Meteor restricts packages' build plugin access to assets, we have to work around by requiring the additional [/spencern/reaction-analytics-libs](/spencern/reaction-analytics-libs) package where the analytics source files are kept.

## Installation

1. `meteor add spencern:reaction-analytics`
2. create empty `custom.analytics.json` file someone where in your project. ( Such as: `/client/analytics/custom.analytics.json`)
3. Edit `custom.analytics.json` to enable or disable analytics libraries that you use.

## Defaults
You must create a file named `custom.analytics.json` to enable this package, if you leave it empty, the following settings will be used:

```JSON
{"libs": {
  "segmentio":          true,
  "googleAnalytics":    false,
  "mixpanel":           false
}}
```

### License
This package is licensed with the MIT license.

### Roadmap
* Event tracking
* Ecommerce analytics


### Thanks

Thanks to [Nemo64](https://github.com/Nemo64) for his [meteor-bootstrap](https://github.com/Nemo64/meteor-bootstrap) package which showed me how to work around the build package limitations.

Example use:

    <a href="{{pathForSEO 'product' 'handle'}}" data-event-category="grid" data-event-action="product-click" data-event-label="Grid product click" data-event-product="{{_id}}">

Stores event tracking data in ReactionAnalytics collection.
