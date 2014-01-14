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
