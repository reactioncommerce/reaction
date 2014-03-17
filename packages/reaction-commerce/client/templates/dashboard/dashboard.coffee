Template.dashboard.helpers
  isVisible: ->
    Session.get("dashboard")

  isCurrent: ->


  Package: ->
    # package view is aware of Package / Context / Route / Permissions
    #
    # currentContext = Session.get('currentDashboard')
    currentPackage = Session.get 'currentPackage'
    unless currentPackage? then Session.set 'currentPackage', "reaction-commerce"
    packageInfo = Meteor.app.packages[currentPackage]
    packageInfo

  packages: ->
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

Template.dashboard.events
  'click .dashboard-navbar-package': (event, template) ->
    Session.set "currentPackage", @.name
    if @.overviewRoute? then Router.go(@.overviewRoute)
    event.preventDefault()

  'click .next': (event, template) ->
      owl.trigger('owl.next')

  'click .prev': (event, template) ->
      owl.trigger('owl.prev')

Template.dashboard.rendered = ->
  $(".dashboard").owlCarousel
    lazyload: true
    # items: 6;
    # itemsScaleUp: true;
    navigation: false;
    pagination: false;
