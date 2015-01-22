ReactionCore.canCheckoutAsGuest = () ->
  return Meteor.settings?.public?.CHECKOUT_AS_GUEST || false

