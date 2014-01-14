Template.shopHeader.events
  'click .cart-icon': () ->
    $("#cart-drawer").fadeToggle "slow", "linear"