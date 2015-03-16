###
progressbar status: "visited first","previous visited","active","next"
###
Template.checkoutProgressBar.helpers
  loginStatus: () ->
    if getGuestLoginState()
      status = "previous visited"
    else
      status = "active"
    return status

  shippingStatus: () ->
    cart = Cart.findOne()
    if (getGuestLoginState() and cart?.shipping?.address and cart?.payment?.address)
      status = "previous visited"
    else if getGuestLoginState()
      status = "active"
    return status

  shippingOptionStatus: () ->
    cart = Cart.findOne()
    if cart?.shipping?.address and cart?.payment?.address
      if (getGuestLoginState() and Session.get("shipmentMethod"))
        status = "previous visited"
      else if (getGuestLoginState() and cart?.shipping?.address and cart?.payment?.address)
        status = "active"
      return status

  reviewStatus: () ->
    cart = Cart.findOne()

    if getGuestLoginState() and cart?.shipping?.shipmentMethod?.shopId and cart?.payment?.address
        status = "active"
    else if (getGuestLoginState() and cart?.shipping?.shipmentMethod?.shopId and cart?.payment?.address and Session.get("shipmentMethod"))
      status = "next"
    return status

