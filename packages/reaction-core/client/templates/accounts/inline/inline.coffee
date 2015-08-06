Template.loginInline.events
  'click .continue-guest': (event, template) ->
    event.preventDefault()
    Session.set "guestCheckoutFlow", true
