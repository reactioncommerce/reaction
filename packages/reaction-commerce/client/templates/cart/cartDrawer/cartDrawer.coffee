### **************************************************************
# Template Cart Drawer
# ************************************************************ ###
Template.cartDrawer.helpers
  cartCount: ->
    Session.get "cartCount"
  displayCartDrawer: (cartCount)->
    cartCount = this.cartCount
    if Session.get "displayCart"
      if cartCount > 0
        return Template.openCartDrawer
      else
        return Template.emptyCartDrawer
    else
      return null


Template.openCartDrawer.helpers
  cartItems: ->
    currentCart = Cart.findOne()
    items = (cart for cart in currentCart.items by -1) if currentCart?.items
    items

  checkoutView: ->
    checkoutView = "display:block"
    if Router.current().route.name is 'cartCheckout' then checkoutView

Template.openCartDrawer.events
  'click #btn-checkout': (event,template) ->
    Session.set "displayCart", false
    CartWorkflow.checkout()

  'click .remove-cart-item': (event,template) ->
    event.stopPropagation()
    event.preventDefault()
    currentCartId = Cart.findOne()._id
    currentVariant = this.variants

    $(event.currentTarget).fadeOut(300).delay 300, ()->
      Meteor.call('removeFromCart',currentCartId,currentVariant)

Template.emptyCartDrawer.events
  'click #btn-keep-shopping': (event,template) ->
    event.stopPropagation()
    event.preventDefault()
    toggleSession "displayCart"