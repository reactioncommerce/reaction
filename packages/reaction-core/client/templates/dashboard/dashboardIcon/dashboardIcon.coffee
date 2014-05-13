Template.dashboardIcon.helpers
  toggleStateClass: () ->
    state = Session.get "dashboard"
    if state is true
      return "fa fa-th dashboard-state-active"
    else
      return "fa fa-th"

Template.dashboardIcon.events
  "click .dashboard-toggle": (event, template) ->
    toggleSession "dashboard"

  "click .dashboard-display": (event, template) ->
    Router.go "dashboard"