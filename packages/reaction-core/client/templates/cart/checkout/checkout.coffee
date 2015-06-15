@addressBookEditId = new ReactiveVar()

###
# the cart helpers mostly control what cart block display and when.
###
Template.cartCheckout.helpers
  cart: ->
    return Cart.findOne()

  account: ->
    account = ReactionCore.Collections.Accounts.findOne()

  loginStatus: () ->
    if !getGuestLoginState()
      status = false
    else
      status = "checkout-step-badge-completed"
    return status

  addressStatus: () ->
    cart = ReactionCore.Collections.Cart.findOne()
    account = ReactionCore.Collections.Accounts.findOne()
    shippingExists = cart?.shipping?.address.fullName || false
    addressExists = account?.profile?.addressBook || false
    paymentExists = cart?.payment?.address || false
    editingAddress = addressBookEditId.get() || false
    Session.setDefault "addressBookView", "addressBookAdd" # configure addressBookView
    #
    # determine addressBook views
    #
    # editing address
    if getGuestLoginState() and editingAddress and Session.equals("addressBookView","addressBookEdit")
      Session.set "addressBookView", "addressBookEdit"
      return "checkout-step-badge"
    # default view
    if getGuestLoginState() and addressExists
      Session.set "addressBookView", "addressBookGrid"
      return "checkout-step-badge-completed"
    # ready to add address
    else if getGuestLoginState()
      Session.set "addressBookView", "addressBookAdd"
      return "checkout-step-badge"
    # disabled
    else
      return false

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

Template.cartCheckout.onRendered = ->
  Session.set "displayCartDrawer", false
