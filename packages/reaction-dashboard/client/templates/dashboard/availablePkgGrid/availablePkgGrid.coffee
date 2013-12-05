Template.availablePkgGrid.helpers availablePkgs: ->
  Meteor.app.packages

Template.availablePkgGrid.rendered = ->
  pkgGrid = new Packery(document.querySelector(".apps-container"),
    gutter: 2
  )

Template.availablePkgGrid.events "click .selector": (e, template) ->

