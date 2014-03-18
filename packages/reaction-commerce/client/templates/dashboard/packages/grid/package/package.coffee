# *****************************************************
# Enable or disable packages
# Enable adds to reaction_config, sets enabled = true
# disable just sets enabled flag to false
# *****************************************************

# returns enabled status for this user for specific package
Template.gridPackage.helpers
  isEnabled: (name) ->
    Packages.find(name: name).count() > 0

  pkgTypeClass: ->
    if @.hasWidget
      pkg =
        class: "pkg-app-class"
        text: "App"
    else
      pkg =
        class: "pkg-feature-class"
        text: "Core"
    pkg


Template.gridPackage.events
  "click .enablePkg": (event, template) ->
    event.preventDefault()
    pkg = Packages.findOne(name: @name)
    unless pkg
      Packages.insert name: @name
      Alerts.add @label + " is now enabled.", "success"

    Router.go @settingsRoute  if @settingsRoute

  "click .disablePkg": (event, template) ->
    event.preventDefault()
    pkg = Packages.findOne(name: @name)
    Packages.remove pkg._id
    Alerts.add @label + " is now disabled.", "success"