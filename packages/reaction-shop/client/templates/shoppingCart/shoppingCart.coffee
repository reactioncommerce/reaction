Template.shopCartIcon.helpers
  cartCount: ->
    count = 0
    if Session.get('serverSession')
      currentCart = Cart.findOne()
    if currentCart
      for items in currentCart.items
        count += items.quantity
      return count

Template.shopCartIconList.helpers
  cartList: ->
    currentCart = Cart.findOne()
    if currentCart
      return currentCart.items