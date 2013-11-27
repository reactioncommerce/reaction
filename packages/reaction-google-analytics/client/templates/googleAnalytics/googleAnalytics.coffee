Template.googleAnalytics.aggregateData = ->
  config = ReactionConfig.findOne
    userId: Meteor.userId()
    name: "reaction-google-analytics"
  if config
    for metafield in config.metafields
      config[metafield.name] = metafield.value
  config

Template.googleAnalytics.events
  "submit form": (event) ->
    event.preventDefault()
    property = $(event.target).find("[name=input-property]").val()
    config = ReactionConfig.findOne(
      userId: Meteor.userId()
      name: "reaction-google-analytics"
    )
    metafields = config.metafields || []
    set = false
    for metafield in metafields
      if metafield.name == "property"
        metafield.value = property
        set = true
    if !set
      metafields.push
        name: "property"
        value: property
    ReactionConfig.update
      _id: config._id
    ,
      $set:
        metafields: metafields

    $.pnotify
      title: "Saved \"" + property + "\""
      text: "Google Analytics is now configured."
      type: "success"
    Router.go "dashboard"
  "click .cancel": (event) ->
    history.go -1
    false
