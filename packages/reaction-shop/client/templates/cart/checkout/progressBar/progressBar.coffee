###
progressbar status: "visited first","previous visited","active","next"
###
Template.checkoutProgressBar.helpers
  loginStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId"))
        status = "visited first"
    else if Meteor.user()
      status = "active"
    status

  shippingStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId"))
      status = "previous visited"
    else if Meteor.user()
      status = ""
    status

  shippingOptionStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId") and Session.get("shippingMethod"))
      status = "previous visited"
    else if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId"))
      status = "active"
    status

  paymentStatus: () ->
    if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId") and Session.get("shippingMethod") and Session.get("paymentMethod"))
      status = "previous visited"
    else if (Meteor.user() and Session.get("billingUserAddressId") and Session.get("shippingUserAddressId") and Session.get("shippingMethod"))
      status = "active"
    status