Template.loginDropdown.events
  "click .dropdown-menu": (event,template) ->
    event.stopPropagation()

  "click #logout": (event) ->
    Meteor.logout (err) ->
      Meteor._debug err  if err
      return
    event.preventDefault()
    return

Template.loginDropdown.helpers
  socialImage: ->
    Meteor.user().profile?.picture

Template.userDropdown.rendered =  ->
  setTimeout (->
    $(".dropdown-menu").fadeOut()
  ),1500