Template.cartDrawer.helpers
  cartItems: ->
    currentCart = Cart.findOne()
    items = (cart for cart in currentCart.items by -1) if currentCart?.items
  checkoutView: ->
    true if Router.current().route.name is 'cartCheckout'

Template.cartDrawer.rendered = ->
  $(".owl-carousel").owlCarousel
    items: 5
    responsive: true

Template.cartDrawer.events
  'click .remove-cart-item': (e,template) ->
    Meteor.call('removeFromCart',Cart.findOne()._id,this.variants)
    throwError this.variants.title+" removed","Cart updated","info"

Template.cartSubTotals.helpers
  cartCount: ->
    currentCart = Cart.findOne()
    count = 0
    ((count += items.quantity) for items in currentCart.items) if currentCart?.items
    count

  estShipping: ->
    estShipping = Cart.findOne().shipping?.value
    estShipping

  subTotal: ->
    currentCart = Cart.findOne()
    subtotal = 0
    ((subtotal += (items.quantity * items.variants.price)) for items in currentCart.items) if currentCart?.items
    subtotal.toFixed(2)

  cartTotal: ->
    currentCart = Cart.findOne()
    subtotal = 0
    ((subtotal += (items.quantity * items.variants.price)) for items in currentCart.items) if currentCart?.items
    shipping = parseFloat currentCart.shipping?.value
    subtotal = (subtotal + shipping) unless isNaN(shipping)
    subtotal.toFixed(2)
