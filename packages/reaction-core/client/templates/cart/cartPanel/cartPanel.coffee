Template.cartPanel.events
  'click #btn-checkout': (event,template) ->
    $('#cart-drawer-container').fadeOut()
    Session.set "displayCart", false
    Router.go "cartCheckout"
