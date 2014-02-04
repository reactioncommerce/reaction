# *****************************************************
# returns "active" if we are on the current route
# we can use this in a class to mark current active nav
# *****************************************************
Template.header.events
  'click #login-dropdown-list a.dropdown-toggle': () ->
    setTimeout (->
      $("#login-email").focus()
    ), 100
