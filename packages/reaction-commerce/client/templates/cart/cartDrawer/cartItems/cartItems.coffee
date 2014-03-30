Template.cartDrawerItems.rendered = ->
  $("#cart-drawer-carousel").data('owlCarousel')?.reinit()

#
# 'click .remove-cart-item' is located in cartDrawer.coffee
#