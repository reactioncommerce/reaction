Template.activePkgGrid.helpers
  PackageConfigs: ->
    packageConfigs = []
    existingPackageConfigs = PackageConfigs.find().fetch()
    for packageConfig in existingPackageConfigs
      packageInfo = Meteor.app.packages[packageConfig.name]
      if packageInfo.hasWidget
        packageConfigs.push(_.extend(packageConfig, packageInfo))
    packageConfigs
  hasPackageConfigs: ->
    PackageConfigs.find().count()

Template.activePkgGrid.rendered = ->
  pkgGrid = new Masonry(document.querySelector(".pkg-container"),
    gutter: 2
    columnWidth: 310
  )

Template.activePkgGrid.events "click .tile-gallery": ->
  $(".app-gallery").toggle()
  _.defer ->
    window.availablePkgGridPackery.layout()

