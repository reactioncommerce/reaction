Packages = ReactionCore.Collections.Packages

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

Template.gridPackage.events
  "click .enablePkg": (event, template) ->
    self = @
    event.preventDefault()
    Packages.update template.data._id, {$set: {enabled: true}}, (error, result) ->
      if result is 1
        Alerts.add self.label + i18n.t(gridPackage.pkgEnabled), "success",
          type: "pkg-enabled-" + self.name
        Router.go self.settingsRoute if self.settingsRoute
      else if error
        console.log error

  "click .disablePkg": (event, template) ->
    self = @
    event.preventDefault()
    Packages.update template.data._id, {$set: {enabled: false}}, (error, result) ->
      if result is 1
        Alerts.add self.label + i18n.t(gridPackage.pkgDisabled), "success",
          type: "pkg-enabled-" + self.name
      else if error
        console.log error