Template.googleAnalytics.packageConfig = ->
  PackageConfigs.findOne({name: "reaction-google-analytics"})

Template.googleAnalytics.events
  "submit form": (event) ->
    event.preventDefault()
    property = $(event.target).find("[name=input-property]").val()
    config = PackageConfigs.findOne({name: "reaction-google-analytics"})
    PackageConfigs.update
      _id: config._id
    ,
      $set:
        property: property
    throwError "Google Analytics is now configured.","Saved \"" + property + "\"", "success"
    Router.go "dashboard"

  "click .cancel": (event) ->
    history.go -1
    false
