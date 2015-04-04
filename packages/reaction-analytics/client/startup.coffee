Meteor.startup ->
  Deps.autorun ->
    coreAnalytics = ReactionCore.Collections.Packages.findOne name: "reaction-analytics"
    googleAnalytics = coreAnalytics.settings.public.google-analytics
    mixpanel = coreAnalytics.settings.public.mixpanel
    segmentio = coreAnalytics.settings.public.segmentio
    
    if !coreAnalytics or !coreAnalytics.enabled
      # data not loaded yet or package is disabled
      Alerts.removeType "analytics-not-configured"
      return
    
    #TODO: DRY this up and make it easier to add additional integrations
    if segmentio.enabled
      if segmentio.api_key
        analytics.load(coreAnalytics.settings.public.segmentio.api_key)
        return #Segment loads other analytics libraries as part of it's service
      else if !segmentio.api_key && Roles.userIsInRole(Meteor.user(), "admin")
        _.defer ->
          Alerts.add 'Segment Write Key is not configured. <a href="/dashboard/settings/analytics">Configure now</a> or <a href="/dashboard">disable the Analytics package</a>.', "danger",
            type: "analytics-not-configured", html: true, sticky: true
    
    if googleAnalytics.enabled
      if googleAnalytics.api_key
        ga("create", coreAnalytics.settings.public.google-analytics.api_key, "auto")
      else if !googleAnalytics.api_key && Roles.userIsInRole(Meteor.user(), "admin")
        _.defer ->
          Alerts.add 'Google Analytics Property is not configured. <a href="/dashboard/settings/analytics">Configure now</a> or <a href="/dashboard">disable the Analytics package</a>.', "danger",
            type: "analytics-not-configured", html: true, sticky: true
    
    if mixpanel.enabled
      if mixpanel.api_key
        mixpanel.init(coreAnalytics.settings.public.mixpanel.api_key)
      else if !mixpanel.api_key && Roles.userIsInRole(Meteor.user(), "admin")
        _.defer ->
          Alerts.add 'Mixpanel token is not configured. <a href="/dashboard/settings/analytics">Configure now</a> or <a href="/dashboard">disable the Analytics package</a>.', "danger",
            type: "analytics-not-configured", html: true, sticky: true
    
    if !Roles.userIsInRole(Meteor.user(), 'admin')
      # If admin logged out, hide the alert
      Alerts.removeType "analytics-not-configured"

  # Need to make this more specific. Currently it triggers for any click on any page.
  $(document.body).click (e) ->
    $targets = $(e.target).closest('*[data-event-action]')
    $targets = $targets.parents('*[data-event-action]').add($targets)
    $targets.each (index, element) ->
      $element = $(element)
      analyticsEvent =
        eventType: 'event' #
        category: $element.data('event-category')
        action: $element.data('event-action')
        label: $element.data('event-label')
        value: $element.data('event-value')
      
      if(typeof ga === 'function')
        ga('send', 'event', analyticsEvent.category, analyticsEvent.action, analyticsEvent.label, analyticsEvent.value)
      if(typeof mixpanel === 'object')
        mixpanel.track analyticsEvent.action,
          'Category': analyticsEvent.category
          'Label': analyticsEvent.label
          'Value': analyticsEvent.value
      if(typeof analytics === 'object')
        analytics.track analyticsEvent.action,
          'Category': analyticsEvent.category
          'Label': analyticsEvent.label
          'Value': analyticsEvent.value
          
      ReactionCore.Collections.AnalyticsEvents.insert analyticsEvent
