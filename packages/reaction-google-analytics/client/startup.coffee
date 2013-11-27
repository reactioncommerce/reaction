Meteor.startup ->
  Deps.autorun ->
#    config = ReactionConfig.findOne(
#      userId: Meteor.userId()
#      name: "reaction-google-analytics"
#    )
#
#    property =
    if !property || property == "__KEY__"
      _.defer ->
        $.pnotify(
          title: "Google Analytics"
          text: "Google Analytics Property is not configured.",
          type: "error"
        )
      return
    ga("create", property, "auto");
  $(document.body).click (e) ->
    $targets = $(e.target).closest("*[data-event-action]")
    $targets = $targets.parents("*[data-event-action]").add($targets)
    $targets.each (index, element) ->
      $element = $(element)
      ga("send", "event", $element.data("event-category"), $element.data("event-action"), $element.data("event-label"), $element.data("event-value"))
