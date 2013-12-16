Template.availablePkgGrid.helpers
  availablePkgs: ->
    availablePkgs = []
    for packageName, packageInfo of Meteor.app.packages
      if !_.isFunction(packageInfo)
        availablePkgs.push(packageInfo)
    availablePkgs

Template.availablePkgGrid.rendered = ->
  pkgGrid = new Packery(document.querySelector(".apps-container"),
    gutter: 2
  )

Template.availablePkgGrid.events "click .selector": (e, template) ->

