Template.cartIcon.helpers
  cartCount: ->
    currentCart = Cart.findOne()
    count = 0
    ((count += items.quantity) for items in currentCart.items) if currentCart?.items
    count

Template.cartIcon.events
  'click .cart-icon': () ->
    toggleCartDrawer(true)