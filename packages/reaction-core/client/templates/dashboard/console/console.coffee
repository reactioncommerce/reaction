###
# console nav bar
###
Template.consoleNavBar.events
  'click #dashboard-navbar-close-button': () ->
    toggleSession "displayConsoleNavBar"

  'click #dashboard-drawer-close-button': () ->
    toggleSession "displayConsoleDrawer"

Template.consoleNavBar.helpers
  displayConsoleDrawer: ->
    if Session.get 'displayConsoleDrawer'
      return true

  pkgPermissions: () ->
    if ReactionCore.hasPermission 'console'
      if @.route
        return ReactionCore.hasPermission @.route
      else
        return ReactionCore.hasPermission @.name
    else
      return false


###
# console widgets
# located here rather than dashboard template
# to rerun whenever a new widget is added
###
Template.consoleWidgets.onRendered = ->
  $ ->
    dashboardSwiper = $(".dashboard-container").swiper(
      direction: "horizontal"
      setWrapperSize: true
      loop: false
      slidesPerView: "auto"
      wrapperClass: "dashboard-widget-wrapper"
      slideClass: "dashboard-widget"
    )
  return
