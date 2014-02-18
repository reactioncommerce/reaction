Template.cartCheckout.helpers
  loginStatus: () ->
    unless Meteor.userId()?
      status = "checkout-step-badge"
    else if Meteor.user()
      status = "checkout-step-badge-completed"
    status

  addressStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId"))
      status = "checkout-step-badge-completed"
    else if Meteor.user()
      status =  "checkout-step-badge"
    else
      status = false
    status

  shippingOptionStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId") and Session.get("shipmentMethod"))
      status = "checkout-step-badge-completed"
    else if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId"))
      status = "checkout-step-badge"
    else
      status = false
    status

  checkoutReviewStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId") and Session.get("shipmentMethod"))
      status = true
    status

Template.cartCheckout.rendered = ->
  Session.set "displayCartDrawer", false

Template.cartCheckout.events
  'click #checkout-step-payment-methods': () ->
    # Set review to complete