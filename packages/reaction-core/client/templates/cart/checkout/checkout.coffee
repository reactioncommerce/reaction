Template.cartCheckout.helpers
  cart: ->
    Meteor.subscribe "cart", Session.get "sessionId", Meteor.userId()
    return Cart.findOne()

  loginStatus: () ->
    unless Meteor.userId()?
      status = false
    else if Meteor.user()
      status = "checkout-step-badge-completed"
    return status

  addressStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId"))
      status = "checkout-step-badge-completed"
    else if Meteor.user()
      status =  "checkout-step-badge"
    else
      status = false
    return status

  shippingOptionStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId") and Session.get("shipmentMethod"))
      status = "checkout-step-badge-completed"
    else if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId"))
      status = "checkout-step-badge"
    else
      status = false
    return status

  checkoutReviewStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId") and Session.get("shipmentMethod"))
      status = true
    return status

Template.cartCheckout.rendered = ->
  Session.set "displayCartDrawer", false

Template.cartCheckout.events
  'click #checkout-step-payment-methods': () ->
    # Set review to complete
