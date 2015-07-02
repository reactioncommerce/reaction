Template.loginInline.events
  'click .continue-guest': () ->
    Session.set "guestCheckoutFlow", true
