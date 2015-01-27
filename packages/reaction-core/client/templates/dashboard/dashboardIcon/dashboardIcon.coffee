Template.dashboardIcon.helpers
  toggleStateClass: () ->
    state = Session.get "displayDashboardNavBar"
    if state is true
      return "fa fa-dashboard dashboard-state-active"
    else
      return "fa fa-dashboard"

Template.dashboardIcon.events
  "click #dashboard-drawer-icon": (event, template) ->
    event.preventDefault()
    # if Session.equals "displayDashboardNavBar", false
    #   Router.go "dashboard"
    toggleSession "displayDashboardNavBar"
