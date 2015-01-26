Template.loginDropdown.events
  "click .dropdown-menu": (event) ->
    event.stopPropagation()

  "click #logout": (event, template) ->
    Session.set 'displayDashboardNavBar', false
    Meteor.logout (err) ->
      Meteor._debug err if err
    event.preventDefault()
    template.$('.dropdown-toggle').dropdown('toggle') # close dropdown

  "click .user-accounts-dropdown a": (event, template) ->
    event.preventDefault()
    template.$('.dropdown-toggle').dropdown('toggle') # close dropdown
