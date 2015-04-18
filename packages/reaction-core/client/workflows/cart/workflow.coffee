###
# Enable reactivity on workflow
###
Tracker.autorun ->
  cart = Cart.findOne {}, {fields: {state: 1}}
  state = Session.get("CartWorkflow") || cart?.state
  if state and cart
    if state is "new"
      # if user refreshes, restore state
      Session.set "CartWorkflow", cart.state
      CartWorkflow.current = cart.state
    else
      Cart.update cart._id, {$set:{state:state}}
      if state is "login" and getGuestLoginState()
        CartWorkflow.loggedin()

###
# Define cart workflow
###

CartWorkflow = StateMachine.create(
  initial: Session.get("CartWorkflow") || "new"
  events: [
    { name: "create", from: "new", to: "cart" }
    { name: "addToCart", from: "*", to: "cart" }
    { name: "cart", from: "create", to: "checkout" }
    { name: "checkout", from: "*", to: "login" }
    { name: "login", from: "checkout", to: "loggedin" }
    { name: "loggedin", from: "login", to: "addAddress" }
    { name: "addAddress", from: "loggedin", to: ["shipmentAddress","paymentMethod"]}
    { name: "shipmentAddress", from: ["addAddress","paymentAddress","shipmentMethod","fetchShipmentMethods","payment"], to: "fetchShipmentMethods" }
    { name: "paymentAddress", from: ["addAddress","shipmentAddress","shipmentMethod","fetchShipmentMethods","payment"], to: "fetchShipmentMethods" }
    { name: "fetchShipmentMethods", from: "shipmentAddress", to: "shipmentMethods" }
    { name: "shipmentMethod", from: ["fetchShipmentMethods","shipmentMethod","payment"], to: "payment" }
    { name: "payment", from :["shipmentAddress","billingAddress","shipmentMethod"], to: "paymentAuth" }
    { name: "paymentMethod", from: ["payment","paymentAuth","fetchShipmentMethods"], to: "paymentAuth"}
    { name: "paymentAuth", from: "paymentMethod", to: "inventoryAdjust"}
    { name: "inventoryAdjust", from: "paymentAuth", to: "orderCreated"}
    { name: "orderCreated", from: ["inventoryAdjust","paymentMethod"]  }
  ],
  callbacks: {
    onenterstate: (event, from, to) ->
      Session.set("CartWorkflow",to)

    oncreate: (event, from, to, sessionId, userId) ->
      # we just return and move on from here for now

    onaddToCart: (event, from, to, cartId, productId, variantData, quantity) ->
      if (cartId and productId)
        count = Cart.findOne(cartId).cartCount() || 0
        Meteor.call "addToCart", cartId, productId, variantData, quantity, (error, result) ->
          # When we add the first item to the cart, we geolocate the session/user
          if not error and count is 0
            # If address.city is set, we've already geolocated, so we skip it
            address = Session.get "address"
            locateUser() unless address?.city

    oncheckout: (event, from, to) ->
      Router.go "cartCheckout"

    onlogin: (event, from, to) ->
      # Tracker.autorun handles change of login
      return

    onaddAddress: (event,from, to) ->
      account = ReactionCore.Collections.Accounts.findOne()
      if account?.profile?.addressBook
        @.shipmentAddress() #goto shipment

    onshipmentAddress: (event, from, to, address) ->
      cartId = Cart.findOne()._id
      unless cartId and address then return
      # update shipping address
      Cart.update cartId, {$set: {"shipping.address": address} }
      # refresh rates with new address
      Meteor.call "updateShipmentQuotes", cartId

    onbeforepaymentAddress: (event, from, to, address) ->
      cartId = Cart.findOne()._id
      unless cartId and address then return
      # update payment address
      Cart.update cartId, {$set:{"payment.address":address}} if address

    onfetchshipmentMethods: (event, from, to) ->
      # we could get additional rates here
      return

    onshipmentMethod: (event, from, to, method) ->
      Cart.update Cart.findOne()._id, {$set:{"shipping.shipmentMethod":method}} if method

    onbeforepaymentMethod: (event, from, to, paymentMethod) ->
      sessionId = Session.get "sessionId"
      cart = Cart.findOne(sessionId: sessionId)

      # call payment method
      result = Meteor.call "paymentMethod", cart._id, paymentMethod
      return result

    onpaymentAuth: (event, from, to, paymentMethod) ->
      # before payment really should be async
      cartId = Cart.findOne()._id
      Meteor.call "copyCartToOrder", cartId, (error, result) ->
        if error
          console.log "An error occurred saving the order. : " +error
        else #go to order success
          CartWorkflow.inventoryAdjust(result)
          return


    oninventoryAdjust: (event, from, to, orderId) ->
      Meteor.call "inventoryAdjust", orderId
      # automatically transitions to @.orderCreated(orderId)

    onorderCreated: (event,from,to, orderId) ->
      # fixes timing issue on hot-reload of completed
      return unless orderId
      # clear the existing login preference
      Session.set "guestCheckoutFlow", ''
      Router.go "cartCompleted", _id: orderId
  }
)
