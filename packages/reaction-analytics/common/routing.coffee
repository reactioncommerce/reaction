Router.map ->
  @route 'reactionAnalytics',
    controller: ShopAdminController
    path: 'dashboard/settings/reactionAnalytics'
    template: 'reactionAnalytics'


# Use onRun instead of afterAction so that tracking only happens once per page.
# See: https://github.com/iron-meteor/iron-router/tree/0.9#custom-actions-and-hooks
Router.onRun ->
  coreAnalytics = ReactionCore.Collections.Packages.findOne({name: "reaction-analytics", 'enabled': true})
  
  if coreAnalytics && coreAnalytics.enabled
    googleAnalytics = coreAnalytics.settings.public.googleAnalytics
    mixpanel = coreAnalytics.settings.public.mixpanel
    segmentio = coreAnalytics.settings.public.segmentio
    
    if segmentio.enabled && segmentio.api_key
      analytics.page()
    if googleAnalytics.enabled && googleAnalytics.api_key
      ga("send", "pageview", Iron.Location.get().path ) # per https://github.com/iron-meteor/iron-router/issues/289
    
    # Mixpanel best practice doesn't send pageviews
    
    # Add to reaction analyticsEvent collection
    # analyticsEvent =
    #   eventType: 'pageview'
    #   path: Iron.Location.get().path # per https://github.com/iron-meteor/iron-router/issues/289
    # ReactionCore.Collections.AnalyticsEvents.insert analyticsEvent
  
  @next() #https://github.com/iron-meteor/iron-router/issues/1089
  return
