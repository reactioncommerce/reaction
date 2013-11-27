Meteor.startup ->
  Deps.autorun ->
    config = ReactionConfig.findOne(
      userId: Meteor.userId()
      name: "reaction-google-analytics"
    )
    if !config
      return # data not loaded yet
    if config.metafields
      for metafield in config.metafields
        if metafield.name == "property"
          property = metafield.value
          if property && property != "__KEY__"
            ga("create", property, "auto")
            return
    _.defer ->
      $.pnotify(
        title: "Google Analytics"
        text: "Google Analytics Property is not configured.",
        type: "error"
      )
  $(document.body).click (e) ->
    $targets = $(e.target).closest("*[data-event-action]")
    $targets = $targets.parents("*[data-event-action]").add($targets)
    $targets.each (index, element) ->
      $element = $(element)
      ga("send", "event", $element.data("event-category"), $element.data("event-action"), $element.data("event-label"), $element.data("event-value"))
