Template.shoppingCartCheckoutList.helpers
  cartList: ->
    currentCart = Cart.findOne()
    if currentCart and currentCart.items
      return currentCart.items

  image:(variantId)->
    getVariantImage(variantId)

Template.shoppingCartCheckoutList.events
  'click .remove': (e,template) ->
    Meteor.call('removeFromCart',Cart.findOne()._id,this.variants)