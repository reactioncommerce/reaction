Template.dashboard.helpers
  route: ->
    return Router.current().route.getName()

  displayConsoleNavBar: ->
    if ReactionCore.hasPermission('console') and Session.get "displayConsoleNavBar"
      return true

  displayConsoleDrawer: ->
    if ReactionCore.hasPermission('console') and Session.get "displayConsoleDrawer"
      return true

Template.dashboard.events
  'click .dashboard-navbar-package': (event, template) ->
    Session.set "currentPackage", @.route
    if @.route?
      event.preventDefault()
      Router.go(@.route)
