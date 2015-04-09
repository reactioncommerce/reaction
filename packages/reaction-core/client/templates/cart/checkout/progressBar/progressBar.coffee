###
progressbar status: "visited first","previous visited","active","next"
###
Template.checkoutProgressBar.helpers
  loginStatus: () ->
    if getGuestLoginState()
      return "previous visited"
    else
      return "active"
    return

  shippingStatus: () ->
    cart = Cart.findOne()
    if (getGuestLoginState() and cart?.shipping?.address and cart?.payment?.address)
      return "previous visited"
    else if getGuestLoginState()
      return "active"
    return

  shippingOptionStatus: () ->
    cart = Cart.findOne()
    if cart?.shipping?.address and cart?.payment?.address
      if (getGuestLoginState() and Session.get("shipmentMethod"))
        return "previous visited"
      else if (getGuestLoginState() and cart?.shipping?.address and cart?.payment?.address)
        return "active"
    return

  reviewStatus: () ->
    cart = Cart.findOne()

    if getGuestLoginState() and cart?.shipping?.shipmentMethod?.shopId and cart?.payment?.address
      return "active"
    else if getGuestLoginState() and cart?.shipping?.shipmentMethod?.shopId and cart?.payment?.address
      return "next"
    return

