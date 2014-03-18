Template.googleAnalytics.packageConfig = ->
  Packages.findOne({name: "reaction-google-analytics"})

Template.googleAnalytics.events
  "submit form": (event) ->
    event.preventDefault()
    property = $(event.target).find("[name=google-input-property]").val()
    config = Packages.findOne({name: "reaction-google-analytics"})
    Packages.update
      _id: config._id
    ,
      $set:
        property: property
    Alerts.add "Google Analytics settings saved.", "success"
    Router.go "dashboard"

  "click .cancel": (event) ->
    history.go -1
    false
