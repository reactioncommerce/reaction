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
###
Template.consoleWidgets.rendered = ->
  @autorun ->
    $ ->
      dashboardSwiper = $(".dashboard-container").swiper(
        mode: "horizontal"
        loop: false
        slidesPerView: "auto"
        wrapperClass: "dashboard-widget-wrapper"
        slideClass: "dashboard-widget"
      )
    return
