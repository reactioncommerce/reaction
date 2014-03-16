Template.dashboardSidebar.helpers
  toggleStateClass: () ->
    state = Session.get "dashboard"
    if state is true
      return "fa fa-angle-double-left"
    else
      return "fa fa-angle-double-right"

Template.dashboardSidebar.events
  "click .dashboard-toggle": (event, template) ->
    unless Router.current().path is "/dashboard"
      toggleSession "dashboard"
    else
      history.go -1
      false

  "click .dashboard-display": (event, template) ->
    Router.go "dashboard"

  "click .dashboard-logout": (event, template) ->
    event.preventDefault()
    Meteor.logout (err) ->
      if err
        Alerts.add err.reason, "warning"
      else
        Router.go "/"


