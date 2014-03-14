Template.dashboard.helpers
  isVisible: ->
    Session.get("dashboard")

  isDashboard: ->
    if Router.current().path is "/dashboard" then return true

  Package: ->
    packageInfo = Meteor.app.packages["reaction-commerce"]
    packageInfo

  Packages: ->
    packageConfigs = []
    existingPackages = Packages.find().fetch()
    for packageConfig in existingPackages
      packageInfo = Meteor.app.packages[packageConfig.name]
      if packageInfo?.hasWidget
        packageConfigs.push(_.extend(packageConfig, packageInfo))
    packageConfigs

  dependencies: ->
    currentPackageDepends  = Meteor.app.packages["reaction-commerce"].depends
    dependencies = []
    Packages.find().forEach (packageConfig) ->
      packageInfo = Meteor.app.packages[packageConfig.name]
      if _.intersection(currentPackageDepends, packageInfo?.provides).length
        dependencies.push(_.extend(packageConfig, packageInfo))
    dependencies

Template.dashboard.rendered = ->
  $("#reaction-commerce").removeClass("hidden").addClass("active")

Template.dashboard.events
  'click .nav-packages': (event, template) ->
    $(".dashboard").removeClass("active").addClass("hidden")
    $("#" +@.name).removeClass("hidden")