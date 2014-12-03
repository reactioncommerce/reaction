Template.loginDropdown.events
  "click .dropdown-menu": (event,template) ->
    event.stopPropagation()

  "click #logout": (event) ->
    Session.set 'dashboard',false
    Meteor.logout (err) ->
      Meteor._debug err if err
    event.preventDefault()
    $(template.find('.dropdown-toggle')).dropdown('toggle') # close dropdown

  "click .user-accounts-dropdown a": (event,template) ->
    event.stopPropagation()
    $(template.find('.dropdown-toggle')).dropdown('toggle') # close dropdown
