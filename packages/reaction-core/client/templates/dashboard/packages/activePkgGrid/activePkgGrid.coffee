Template.activePkgGrid.helpers
  Packages: ->
    packageConfigs = []
    existingPackages = Packages.find().fetch()
    for packageConfig in existingPackages
      packageInfo = Meteor.app.packages[packageConfig.name]
      if packageInfo.hasWidget
        packageConfigs.push(_.extend(packageConfig, packageInfo))
    packageConfigs
  hasPackages: ->
    Packages.find().count()

Template.activePkgGrid.rendered = ->
  pkgGrid = new Masonry(document.querySelector(".pkg-container"),
    gutter: 2
    columnWidth: 310
  )

Template.activePkgGrid.events "click .tile-gallery": ->
  $(".app-gallery").toggle()
  _.defer ->
    window.availablePkgGridPackery.layout()

