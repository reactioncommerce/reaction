Template.cartIcon.events
  'click .cart-icon': () ->
    $('#cart-drawer-container').fadeOut(300, ()->
      toggleSession "displayCart")