Template.loginInline.helpers
  allowGuestCheckout: ->
    return ReactionCore.allowGuestCheckout

Template.loginInline.events
  'click .continue-guest': () ->
    Session.set "guestCheckoutFlow", true
