Template.shoppingCartCheckoutList.helpers
  cartList: ->
    currentCart = Cart.findOne()
    if currentCart and currentCart.items
      return currentCart.items

  image:(variantId)->
    variants = Products.findOne({"variants._id":variantId},{fields:{"variants":true}}).variants
    variant = _.filter(variants, (item)-> item._id is variantId)

    if variant[0].medias and variant[0].medias[0].src?
      variant[0].medias[0].src
    else
      variants[0].medias[0].src

Template.shoppingCartCheckoutList.events
  'click .remove': (e,template) ->
    Meteor.call('removeFromCart',Cart.findOne()._id,this.variants)