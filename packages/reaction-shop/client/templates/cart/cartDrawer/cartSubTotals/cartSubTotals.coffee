### **************************************************************
# Template Cart Sub Totals
# ************************************************************ ###
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
