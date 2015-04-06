Template.reactionAnalytics.helpers
  packageData: ->
    return ReactionCore.Collections.Packages.findOne name: "reaction-analytics"
  
# Helpers to enable or disable options fieldsets
  googleAnalyticsEnabled: ->
    return typeof ga == 'function'
  
  segmentioEnabled: ->
    return typeof analytics == 'object'
  
  mixpanelEnabled: ->
    return typeof mixpanel == 'object'



AutoForm.hooks "analytics-update-form":
  onSuccess: (operation, result, template) ->
    Alerts.removeType "analytics-not-configured"
    Alerts.add "Analytics settings saved.", "success", type: "analytics-settings"

  onError: (operation, error, template) ->
    msg = error.message || error.reason || "Unknown error"
    Alerts.add "Analytics settings update failed: " + msg, "danger", type: "analytics-settings"
