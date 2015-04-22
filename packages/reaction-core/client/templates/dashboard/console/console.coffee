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
    if ReactionCore.hasOwnerAccess() and Session.get 'displayConsoleDrawer'
      return true

###
# console widgets
# located here rather than dashboard template
# to rerun whenever a new widget is added
###
Template.consoleWidgets.rendered = ->
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
