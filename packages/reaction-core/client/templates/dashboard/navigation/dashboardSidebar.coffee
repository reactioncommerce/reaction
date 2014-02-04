Template.dashboardSidebar.events
  "click .dashboard-back": (e) ->

    #/e.preventDefault;
    history.go -1
    false

  "click .dashboard-logout": ->
    event.preventDefault()
    Meteor.logout (err) ->
      if err
        throwAlert err.reason
      else
        Router.go "/"


