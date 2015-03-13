# Reaction Analytics

This provides an analytics framework for hooking into other analytics services
such as Google Analytics, Mixpanel, etc.

Example use:

    <a href="{{pathForSEO 'product' 'handle'}}" data-event-category="grid" data-event-action="product-click" data-event-label="Grid product click" data-event-product="{{_id}}">

Stores event tracking data in ReactionAnalytics collection.

Provides access to third-party analytics providers via collection insert hook
