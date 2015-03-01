Template.cartCheckout.helpers
  cart: ->
    return Cart.findOne()

  loginStatus: () ->
    if !getGuestLoginState()
      status = false
    else
      status = "checkout-step-badge-completed"
    return status

  addressStatus: () ->
    cart = Cart.findOne()
    if (getGuestLoginState() and cart?.shipping?.address and cart?.payment?.address)
      status = "checkout-step-badge-completed"
    else if getGuestLoginState()
      status =  "checkout-step-badge"
    else
      status = false
    return status

  shippingOptionStatus: () ->
    cart = Cart.findOne()
    if cart?.shipping?.address and cart?.payment?.address
      if (getGuestLoginState() and Session.get("shipmentMethod"))
        status = "checkout-step-badge-completed"
      else if (getGuestLoginState())
        status = "checkout-step-badge"
    else
      status = false
    return status

  checkoutReviewStatus: () ->
    cart = Cart.findOne()
    if getGuestLoginState() and cart?.shipping?.shipmentMethod?.shopId and cart?.payment?.address
      return true

Template.cartCheckout.rendered = ->
  Session.set "displayCartDrawer", false
