CartWorkflow = {}
Deps.autorun (->
  CartWorkflow = StateMachine.create(
    initial: Cart.findOne()?.state || "new"
    events: [
      { name: "create", from: "new", to: "cart" }
      { name: "addToCart", from: "*", to: "cart" }
      { name: "cart", from: "create", to: "checkout" }
      { name: "checkout", from: "*", to: "login" }
      { name: "login", from: "checkout", to: "loggedin" }
      { name: "loggedin", from: "login", to: "shipmentAddress" }
      { name: "shipmentAddress", from: "loggedin", to: "shipmentQuote" }
      { name: "shipmentMethod", from: "shipmentAddress", to: "payment" }
      { name: "paymentAddress", from: "checkout", to: "paymentAuth" }
      { name: "payment", from :["shipmentAddress","billingAddress"], to: "paymentAuth" }
      { name: "paymentAuth", from: "payment", to: "inventoryAdjust"}
      { name: "inventoryAdjust", from: "paymentAuth", to: "orderCreate"}
      { name: "orderCreate", from: "inventoryAdjust"  }
    ],
    callbacks: {
      onenterstate: (event, from, to) ->
        console.log event,from,to
        cart = Cart.findOne()
        Cart.update(cart._id,{$set:{state:to}}) if cart?

      oncreate: (event, from, to, sessionId, userId) ->
        # console.log "creating new cart"
        (sessionId = Session.get "sessionId") unless sessionId
        Meteor.call "createCart", cartSession: { sessionId:sessionId, userId:userId }

      onaddToCart: (event, from, to, cartSession, productId, variantData, quantity) ->
        if (cartSession? and productId?)
          Meteor.call "addToCart", cartSession, productId, variantData, quantity

      oncheckout: (event, from, to) ->
        Router.go "cartCheckout"

      # onlogin: (event, from, to) ->
      #   if Meteor.userId() then CartWorkflow.loggedin()

      onentershipmentAddress: (event, from, to, address) ->
        Cart.update Cart.findOne()._id, {$set:{"shipping.address":address}} if address

      onenterpaymentAddress: (event, from, to, address) ->
        Cart.update Cart.findOne()._id, {$set:{"payment.address":address}} if address

      onentershipmentMethod: (event, from, to, method) ->
        Cart.update Cart.findOne()._id, {$set:{"shipping.shippingMethod":method}} if method
    }
  )
  return CartWorkflow
)

Deps.autorun ()->
  if Meteor.userId() and Cart.findOne()?.state is "login"
    CartWorkflow.loggedin()
