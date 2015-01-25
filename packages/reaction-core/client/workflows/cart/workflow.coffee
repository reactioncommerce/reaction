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
      if state is "login" and Meteor.userId()
        # console.log "setting logged in"
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
    { name: "addAddress", from: "loggedin", to: "shipmentAddress" }
    { name: "shipmentAddress", from: ["addAddress","paymentAddress","shipmentMethod","fetchShipmentMethods","payment"], to: "fetchShipmentMethods" }
    { name: "paymentAddress", from: ["addAddress","shipmentAddress","shipmentMethod","fetchShipmentMethods","payment"], to: "fetchShipmentMethods" }
    { name: "fetchShipmentMethods", from: "shipmentAddress", to: "shipmentMethods" }
    { name: "shipmentMethod", from: ["fetchShipmentMethods","shipmentMethod","payment"], to: "payment" }
    { name: "payment", from :["shipmentAddress","billingAddress","shipmentMethod"], to: "paymentAuth" }
    { name: "paymentMethod", from: "payment", to: "paymentAuth"}
    { name: "paymentAuth", from: "paymentMethod", to: "inventoryAdjust"}
    { name: "inventoryAdjust", from: "paymentAuth", to: "orderCreated"}
    { name: "orderCreated", from: "inventoryAdjust"  }
  ],
  callbacks: {
    onenterstate: (event, from, to) ->
      Session.set("CartWorkflow",to)

    oncreate: (event, from, to, sessionId, userId) ->
      Cart.findOne()

    onaddToCart: (event, from, to, cartSession, productId, variantData, quantity) ->
      if (cartSession? and productId?)
        count = getCartCount()
        Meteor.call "addToCart", cartSession, productId, variantData, quantity, (error, result) ->
          # When we add the first item to the cart, we geolocate the session/user
          if not error and count is 0
            # If address.city is set, we've already geolocated, so we skip it
            address = Session.get "address"
            locateUser() unless address?.city

    oncheckout: (event, from, to) ->
      Router.go "cartCheckout"

    onlogin: (event, from, to) ->
      #Deps handles change of login

    onaddAddress: (event,from, to) ->
      if Meteor.user()?.profile.addressBook
        @.shipmentAddress()

    onshipmentAddress: (event, from, to, address) ->
      Cart.update Cart.findOne()._id, {$set:{"shipping.address":address}} if address

    onpaymentAddress: (event, from, to, address) ->
      Cart.update Cart.findOne()._id, {$set:{"payment.address":address}} if address

    onfetchshipmentMethods: (event, from, to) ->
      #we could get rates here

    onshipmentMethod: (event, from, to, method) ->
      Cart.update Cart.findOne()._id, {$set:{"shipping.shipmentMethod":method}} if method

    onbeforepaymentMethod: (event, from, to, paymentMethod) ->
      sessionId = Session.get "sessionId"
      Meteor.call "paymentMethod", sessionId, Cart.findOne()._id, paymentMethod

    onpaymentAuth: (event, from, to, paymentMethod) ->
      #before payment really should be async
      Meteor.setTimeout (->
        Meteor.call "copyCartToOrder", Cart.findOne(), (error, result) ->
          if error
            console.log "An error occurred saving the order. : " +error
          else #go to order success
            CartWorkflow.inventoryAdjust(result)
      ), 250

    oninventoryAdjust: (event, from, to, orderId) ->
      Meteor.call "inventoryAdjust", orderId
      # automatically transitions to @.orderCreated(orderId)

    onorderCreated: (event,from,to, orderId) ->
      #fixes timing issue on hot-reload of completed
      return unless orderId
      Router.go "cartCompleted", _id: orderId
      ###
      # clear cart variables
      # todo: move these to cartID specific
      # commented, these should now get reused by a new cart
      ###
      # delete Session.keys["billingUserAddressId"]
      # delete Session.keys["shippingUserAddressId"]
      # delete Session.keys["shipmentMethod"]
  }
)