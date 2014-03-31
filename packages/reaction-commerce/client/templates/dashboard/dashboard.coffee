Deps.autorun () ->
  Session.get "currentPackage"
  if $(".dashboard")?
    if $(".dashboard").data('owlCarousel')?
      # console.log "reinit dashboard"
      setTimeout (->
        $(".dashboard").data('owlCarousel').reinit()
      ), 1
    else
      setTimeout (->
        # console.log "recreating owl dashboard"
        $(".dashboard").owlCarousel
          navigation: false
          pagination: false
          autoHeight: true
      ), 1

Deps.autorun () ->
  Session.get("dashboard")
  #console.log "ensure newly visible dashboard has carousel"
  setTimeout (->
    $(".dashboard").owlCarousel
      navigation: false
      pagination: false
      autoHeight: true
    ), 1

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

  'click .next': (event, template) ->
      owl.trigger('owl.next')

  'click .prev': (event, template) ->
      owl.trigger('owl.prev')

Template.dashboard.rendered = ->
  # console.log "dashboard.initial template rendered"
  $(".dashboard").owlCarousel
    navigation: false
    pagination: false
    autoHeight: true


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

