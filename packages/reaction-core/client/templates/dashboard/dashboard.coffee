Template.dashboard.helpers
  displayConsoleNavBar: ->
    if ReactionCore.hasOwnerAccess() and Session.get "displayConsoleNavBar"
      return true

  displayConsoleDrawer: ->
    if ReactionCore.hasOwnerAccess() and Session.get "displayConsoleDrawer"
      return true

Template.dashboard.events
  'click .dashboard-navbar-package': (event, template) ->
    Session.set "currentPackage", @.route
    if @.route?
      event.preventDefault()
      Router.go(@.route)

