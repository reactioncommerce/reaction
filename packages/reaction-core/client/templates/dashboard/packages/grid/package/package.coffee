# returns enabled status for this user for specific package
Template.gridPackage.helpers
  pkgTypeClass: ->
    if @.hasWidget
      pkg =
        class: "pkg-app-class"
        text: "App"
    else
      pkg =
        class: "pkg-feature-class"
        text: "Core"
    return pkg

  hasOverviewRoute: ->
    unless @.overviewRoute is "dashboard"
      if ReactionCore.hasPermission(@.overviewRoute) and @.enabled then return true

Template.gridPackage.events
  "click .enablePkg": (event, template) ->
    self = @
    event.preventDefault()
    ReactionCore.Collections.Packages.update template.data._id, {$set: {enabled: true}}, (error, result) ->
      if result is 1
        Alerts.add self.label + i18n.t("gridPackage.pkgEnabled"), "success",
          type: "pkg-enabled-" + self.name
          autoHide: true
        Router.go self.settingsRoute if self.settingsRoute
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