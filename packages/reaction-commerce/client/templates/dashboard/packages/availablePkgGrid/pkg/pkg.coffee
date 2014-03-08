# *****************************************************
# Enable or disable packages
# Enable adds to reaction_config, sets enabled = true
# disable just sets enabled flag to false
# *****************************************************

# returns enabled status for this user for specific package
Template.pkg.helpers isEnabled: (name) ->
  Packages.find(name: name).count() > 0

Template.pkg.events
  "click .enablePkg": (event, template) ->
    event.preventDefault()
    pkg = Packages.findOne(name: @name)
    unless pkg
      Packages.insert name: @name
      Alerts.add @label + " is now enabled.", "success"

    Router.go @route  if @route

  "click .disablePkg": (event, template) ->
    event.preventDefault()
    pkg = Packages.findOne(name: @name)
    Packages.remove pkg._id
    Alerts.add @label + " is now disabled.", "success"