# returns enabled status for this user for specific package
Template.gridPackage.helpers
  #
  # TODO: get rid of this will some more meaningful
  #  and predictable indicator
  # .. verion .. testing .. community
  #
  pkgTypeClass: ->
    if @.priority is 1
      pkg =
        class: "pkg-feature-class"
        text: "Core"
    else
      pkg =
        class: "pkg-app-class"
        text: "App"
    return pkg

Template.gridPackage.events
  "click .enablePkg": (event, template) ->
    self = @
    event.preventDefault()
    ReactionCore.Collections.Packages.update template.data._id, {$set: {enabled: true}}, (error, result) ->
      if result is 1
        Alerts.add self.label + i18n.t("gridPackage.pkgEnabled"), "success",
          type: "pkg-enabled-" + self.name
          autoHide: true
        Router.go self.route if self.route
      else if error
        console.log error

  "click .disablePkg": (event, template) ->
    self = @
    # we don't want to disable autoenabled (core) packages
    if self.autoEnable is true then return
    # update package info
    event.preventDefault()
    ReactionCore.Collections.Packages.update template.data._id, {$set: {enabled: false}}, (error, result) ->
      if result is 1
        Alerts.add self.label + i18n.t("gridPackage.pkgDisabled"), "success",
          type: "pkg-enabled-" + self.name
          autoHide: true
      else if error
        console.log error

  "click .pkg-app-card": (event, template) ->
    Router.go @.route if @.route
