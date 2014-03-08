Template.layoutHeader.events
  'click #login-dropdown-list a.dropdown-toggle': () ->
    setTimeout (->
      $("#login-email").focus()
    ), 100
