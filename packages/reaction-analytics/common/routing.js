Router.map(function() {
  return this.route('dashboard/reactionAnalytics', {
    controller: ShopAdminController,
    path: 'dashboard/settings/reaction-analytics',
    template: 'reactionAnalytics'
  });
});

Router.onRun(function() {
  var coreAnalytics, googleAnalytics, mixpanel, segmentio;
  coreAnalytics = ReactionCore.Collections.Packages.findOne({
    name: "reaction-analytics",
    'enabled': true
  });
  if (coreAnalytics && coreAnalytics.enabled) {
    googleAnalytics = coreAnalytics.settings["public"].googleAnalytics;
    mixpanel = coreAnalytics.settings["public"].mixpanel;
    segmentio = coreAnalytics.settings["public"].segmentio;
    if (segmentio.enabled && segmentio.api_key) {
      analytics.page();
    }
    if (googleAnalytics.enabled && googleAnalytics.api_key) {
      ga("send", "pageview", Iron.Location.get().path);
    }
  }
  this.next();
});

// Using onBeforeAction and not onRun as selectedProductId() is null the first time you view the page
Router.onBeforeAction(function() {
  if (this.route.getName() == 'product') {
    if (selectedProductId()) {
      let analyticsEvent = {
        eventType: 'view',
        value: selectedProductId(),
        label: 'view product details'
      }
      ReactionCore.Collections.AnalyticsEvents.insert(analyticsEvent)
    }
  }
  this.next()
})
