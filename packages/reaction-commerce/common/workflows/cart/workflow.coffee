###
# Enable reactivity on workflow
###
Deps.autorun ->
  state = Session.get("CartWorkflow")
  if Cart.findOne()
    if state and state isnt "new" then Cart.update(Cart.findOne()._id,{$set:{state:state}})
    if state is "new"
      # if user refreshes, restore state
      Session.set "CartWorkflow", Cart.findOne()?.state
      CartWorkflow.current = Cart.findOne()?.state
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
    { name: "shipmentMethod", from: ["fetchShipmentMethods","payment"], to: "payment" }
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
      (sessionId = Session.get "sessionId") unless sessionId
      Meteor.call "createCart", cartSession: { sessionId:sessionId, userId:userId }

    onaddToCart: (event, from, to, cartSession, productId, variantData, quantity) ->
      if (cartSession? and productId?)
        Meteor.call "addToCart", cartSession, productId, variantData, quantity

    oncheckout: (event, from, to) ->
      Router.go "cartCheckout"

    onlogin: (event, from, to) ->
      #Deps handles change of login

    onaddAddress: (event,from, to) ->
      if Meteor.user().profile.addressBook
        @.shipmentAddress()

    onshipmentAddress: (event, from, to, address) ->
      Cart.update Cart.findOne()._id, {$set:{"shipping.address":address}} if address

    onpaymentAddress: (event, from, to, address) ->
      Cart.update Cart.findOne()._id, {$set:{"payment.address":address}} if address

    onfetchshipmentMethods: (event, from, to) ->
      #we could get rates here

    onshipmentMethod: (event, from, to, method) ->
      Cart.update Cart.findOne()._id, {$set:{"shipping.shippingMethod":method}} if method

    onpaymentMethod: (event, from, to, paymentMethod) ->
      Cart.update Cart.findOne()._id, {$set:{"payment.paymentMethod":[paymentMethod]}}

    onpaymentAuth: (event, from, to) ->
      Meteor.call "copyCartToOrder", Cart.findOne(), (error, result) ->
        if error
          console.log "An error occurred saving the order. : " +error
        else #go to order success
          CartWorkflow.inventoryAdjust(result)

    oninventoryAdjust: (event, from, to, orderId) ->
      Meteor.call "inventoryAdjust", orderId
      # @.orderCreated(orderId)

    onorderCreated: (event,from,to, orderId) ->
      #clear cart related sessions
      delete Session.keys["billingUserAddressId"]
      delete Session.keys["shippingUserAddressId"]
      delete Session.keys["shippingMethod"]
      Router.go "cartCompleted", _id: orderId
  }
)