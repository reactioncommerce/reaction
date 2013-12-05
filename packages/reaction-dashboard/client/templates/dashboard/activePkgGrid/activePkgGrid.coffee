Template.activePkgGrid.helpers
  PackageConfigs: ->
    packageConfigs = PackageConfigs.find().fetch()
    _.each packageConfigs, (packageConfig) ->
      _.each Meteor.app.packages, (packageInfo) ->
        _.extend packageConfig, packageInfo  if packageInfo.name is packageConfig.name


    packageConfigs

  hasPackageConfigs: ->
    PackageConfigs.find().count()

Template.activePkgGrid.rendered = ->
  pkgGrid = new Packery(document.querySelector(".pkg-container"),
    gutter: 2
  )

Template.activePkgGrid.events "click .tile-gallery": ->
  $(".app-gallery").toggle()
  appGrid = new Packery(document.querySelector(".apps-container"),
    gutter: 2
  )

