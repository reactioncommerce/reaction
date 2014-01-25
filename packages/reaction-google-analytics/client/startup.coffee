Meteor.startup ->
  Deps.autorun ->
    config = Packages.findOne(
      name: "reaction-google-analytics"
    )
    if !config
      return # data not loaded yet
    if config.property && config.property != "__KEY__"
      ga("create", config.property, "auto")
      return
    if Roles.userIsInRole(Meteor.user(), "admin")
      _.defer ->
        throwError "Google Analytics Property is not configured.","Google Analytics"

  $(document.body).click (e) ->
    $targets = $(e.target).closest("*[data-event-action]")
    $targets = $targets.parents("*[data-event-action]").add($targets)
    $targets.each (index, element) ->
      $element = $(element)
      analyticsEvent =
        category: $element.data("event-category")
        action: $element.data("event-action")
        label: $element.data("event-label")
        value: $element.data("event-value")
      ga("send", "event", analyticsEvent.category, analyticsEvent.action, analyticsEvent.label, analyticsEvent.value)
      share.AnalyticsEvents.insert(analyticsEvent)
