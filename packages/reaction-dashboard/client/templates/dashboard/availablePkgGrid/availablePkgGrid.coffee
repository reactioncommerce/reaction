Template.availablePkgGrid.helpers
  availablePkgs: ->
    availablePkgs = []
    for packageName, packageInfo of Meteor.app.packages
      if !_.isFunction(packageInfo)
        availablePkgs.push(packageInfo)
    availablePkgs

Template.availablePkgGrid.rendered = ->
  window.availablePkgGridPackery = new Packery(document.querySelector(".apps-container"),
    gutter: 2
  )
  template = @
  _.defer ->
    $(template.find(".app-gallery")).hide()

#Template.availablePkgGrid.events
#  "click .toggle-app-gallery-link": (event, template) ->
#    $(template.find(".well")).toggle()

