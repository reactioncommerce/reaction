Template.loginDropdown.events
  "click .dropdown-menu": (event,template) ->
    event.stopPropagation()
    if Meteor.userId()
      $('.dropdown-toggle').dropdown('toggle')

  "click #logout": (event) ->
    Session.set 'dashboard',false
    Meteor.logout (err) ->
      Meteor._debug err  if err
      return
    event.preventDefault()
    return

Template.userDropdown.events
  "click .user-accounts-dropdown > a": (event,template) ->
    $('.dropdown-toggle').dropdown('toggle')