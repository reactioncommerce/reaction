Template.dashboardIcon.helpers
  toggleStateClass: () ->
    state = Session.get "displayDashboardNavBar"
    if state is true
      return "fa fa-th fa-x3 dashboard-state-active"
    else
      return "fa fa-th fa-x3"

Template.dashboardIcon.events
  "click .dashboard-toggle": (event, template) ->
    event.preventDefault()
    if Session.equals "displayDashboardNavBar", false
      Router.go "dashboard"
    toggleSession "displayDashboardNavBar"
