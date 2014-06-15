Template.dashboard.helpers
  isVisible: ->
    if Session.get("dashboard") and Meteor.app.hasOwnerAccess() then return true

  Package: ->
    # package view is aware of Package / Context / Route / Permissions
    #
    # currentContext = Session.get('currentDashboard')
    currentPackage = Session.get 'currentPackage'
    unless currentPackage? then Session.set 'currentPackage', "reaction-commerce"
    packageInfo = Meteor.app.packages[currentPackage]
    packageInfo

  widget: (name) ->
    widget = this.name + "-widget"
    return Template[widget]

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
    if @.overviewRoute?
      event.preventDefault()
      Router.go(@.overviewRoute)

Template.dashboardWidgets.helpers
  widget: (name) ->
    widget = this.name + "-widget"
    return Template[widget]

Template.dashboardWidgets.rendered = ->
  $ ->
    dashboardSwiper = $(".dashboard-container").swiper(
      mode: "horizontal"
      loop: false
      slidesPerView: "auto"
      wrapperClass: "dashboard-widget-wrapper"
      slideClass: "dashboard-widget"
    )
  return

###
# dashboard nav bar
###

Template.dashboardNavBar.helpers
  packages: ->
    packageConfigs = []
    existingPackages = Packages.find().fetch()
    for packageConfig in existingPackages
      packageInfo = Meteor.app.packages[packageConfig.name]
      if packageInfo?.hasWidget
        packageConfigs.push(_.extend(packageConfig, packageInfo))
    packageConfigs

  isActive: ->
    if @.name is Session.get 'currentPackage' then return "active"

