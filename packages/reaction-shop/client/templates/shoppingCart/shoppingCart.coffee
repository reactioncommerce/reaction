Template.shopCartIcon.helpers
  cartCount: ->
    currentCart = Cart.findOne()
    count = 0
    ((count += items.quantity) for items in currentCart.items) if currentCart?.items
    count

Template.shopCartIconList.helpers
  cartList: ->
    currentCart = Cart.findOne()
    currentCart.items if currentCart?.items

Template.shopCartSlide.helpers
  cartItems: ->
    currentCart = Cart.findOne()
    items = (cart for cart in currentCart.items by -1) if currentCart?.items

Template.shopCartSlide.rendered = ->
  $(".owl-carousel").owlCarousel
    items: 5
    responsive: true

Template.shopCartSlide.events
  'click #btn-checkout': () ->
    $("#shop-cart-slide").fadeOut( 100 )

  'click .remove-cart-item': (e,template) ->
    Meteor.call('removeFromCart',Cart.findOne()._id,this.variants)
    throwError this.variants.title+" removed","Cart updated","info"

Template.cartSubTotals.helpers
  cartCount: ->
    currentCart = Cart.findOne()
    count = 0
    ((count += items.quantity) for items in currentCart.items) if currentCart?.items
    count
  subTotal: ->
    currentCart = Cart.findOne()
    subtotal = 0
    ((subtotal += (items.quantity * items.variants.price)) for items in currentCart.items) if currentCart?.items
    subtotal.toFixed(2)

  cartTotal: ->
    currentCart = Cart.findOne()
    subtotal = 0
    ((subtotal += (items.quantity * items.variants.price)) for items in currentCart.items) if currentCart?.items
    subtotal.toFixed(2)
