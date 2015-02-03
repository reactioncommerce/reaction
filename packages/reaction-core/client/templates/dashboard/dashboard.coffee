Packages = ReactionCore.Collections.Packages

Template.dashboard.helpers
  displayDashboardNavBar: ->
    if ReactionCore.hasOwnerAccess() and Session.get "displayDashboardNavBar"
      return true

  displayDashboardDrawer: ->
    if ReactionCore.hasOwnerAccess() and Session.get "displayDashboardDrawer"
      return true

  Package: ->
    # package view is aware of Package / Context / Route / Permissions
    #
    # currentContext = Session.get('currentDashboard')
    currentPackage = Session.get 'currentPackage'
    if currentPackage
      return ReactionCore.Packages[currentPackage]
    else
      Session.set 'currentPackage', "reaction-commerce"
      return "reaction-commerce"

  widget: (name) ->
    widget = this.name + "-widget"
    if Template[widget]
      return Template[widget]
    else
      return null

  dependencies: ->
    currentPackageDepends = ReactionCore.Packages["reaction-commerce"].depends
    dependencies = []
    Packages.find(enabled: true).forEach (p) ->
      packageInfo = p.info()
      if _.intersection(currentPackageDepends, packageInfo?.provides).length
        dependencies.push _.extend(p, packageInfo)
    return dependencies

Template.dashboard.events
  'click .dashboard-navbar-package': (event, template) ->
    Session.set "currentPackage", @.name
    if @.overviewRoute?
      event.preventDefault()
      Router.go(@.overviewRoute)

Template.dashboardWidgets.helpers
  widget: (name) ->
    widget = this.name + "-widget"
    if Template[widget]
      return Template[widget]
    else
      return null

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

Template.dashboardNavBar.events
  'click .dashboard-navbar-package': () ->
    $('.dashboard-navbar-packages ul li').removeClass('active')
    $('#'+@._id).parent().addClass('active')

  'click #dashboard-navbar-close-button': () ->
    toggleSession "displayDashboardNavBar"

  'click #dashboard-drawer-close-button': () ->
    toggleSession "displayDashboardDrawer"

Template.dashboardNavBar.helpers
  displayDashboardDrawer: ->
    if ReactionCore.hasOwnerAccess() and Session.get 'displayDashboardDrawer'
      return true