# Deps.autorun () ->
#   console.log "deps autorun " + Session.get "currentPackage"
#   if $("#dashboard")?
#     if $("#dashboard").data('owlCarousel')?
#       $("#dashboard").data('owlCarousel').reinit()
#       console.log "re-initing"
#     else
#       console.log "initilizing owl"
#       $("#dashboard").owlCarousel
#         lazyload: false
#         navigation: false
#         pagination: false
#         # reactive: Session.get "currentPackage"




Template.dashboard.helpers
  isVisible: ->
    Session.get("dashboard")

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
    setTimeout

  'click .next': (event, template) ->
      owl.trigger('owl.next')

  'click .prev': (event, template) ->
      owl.trigger('owl.prev')





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

