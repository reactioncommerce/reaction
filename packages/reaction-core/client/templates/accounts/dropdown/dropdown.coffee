Template.loginDropdown.events
  "click .dropdown-menu": (event,template) ->
    event.stopPropagation()

  "click #logout": (event) ->
    Meteor.logout (err) ->
      Meteor._debug err  if err
      return
    event.preventDefault()
    return

Template.userDropdown.events
  "click .user-accounts-dropdown > a": (event,template) ->
    $('.dropdown-toggle').dropdown('toggle')

Template.userDropdown.rendered =  ->
  setTimeout (->
      $('.dropdown-toggle').dropdown('toggle')
  ),1500