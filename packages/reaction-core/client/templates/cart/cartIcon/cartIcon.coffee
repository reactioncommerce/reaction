Template.cartIcon.helpers
  cart: ->
    return ReactionCore.Collections.Cart.findOne()

Template.cartIcon.events
  'click .cart-icon': () ->
    $('#cart-drawer-container').fadeOut(300, ()->
      toggleSession "displayCart")
