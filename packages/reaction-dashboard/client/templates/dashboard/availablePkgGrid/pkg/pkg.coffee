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
      $.pnotify
        title: "Enabled package"
        text: @label + " is now enabled."
        type: "success"

    Router.go @route  if @route

  "click .disablePkg": (event, template) ->
    event.preventDefault()
    pkg = Packages.findOne(name: @name)
    Packages.remove pkg._id
    $.pnotify
      title: "Disabled Package"
      text: @label + " is now disabled."
      type: "success"


