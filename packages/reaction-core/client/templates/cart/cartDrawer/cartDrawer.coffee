### **************************************************************
# Template Cart Drawer
# ************************************************************ ###
Template.cartDrawer.helpers
  displayCartDrawer: ->
    unless Session.equals "displayCart", true
      return null

    storedCart = Cart.findOne()
    count = 0
    ((count += items.quantity) for items in storedCart.items) if storedCart?.items
    if count is 0
      return Template.emptyCartDrawer
    else
      return Template.openCartDrawer

Template.openCartDrawer.rendered = ->
  $('#cart-drawer-container').fadeIn()

Template.openCartDrawer.helpers
  cartItems: ->
    Cart.findOne().items

  checkoutView: ->
    checkoutView = "display:block"
    if Router.current().route.getName() is 'cartCheckout' then checkoutView

Template.openCartDrawer.events
  'click #btn-checkout': (event,template) ->
    $('#cart-drawer-container').fadeOut()
    Session.set "displayCart", false
    CartWorkflow.checkout()

  'click .remove-cart-item': (event,template) ->
    event.stopPropagation()
    event.preventDefault()
    currentCartId = Cart.findOne()._id
    currentVariant = this.variants
    sessionId = Session.get "sessionId"

    $(event.currentTarget).fadeOut 300, ->
      Meteor.call 'removeFromCart', sessionId, currentCartId, currentVariant

Template.emptyCartDrawer.events
  'click #btn-keep-shopping': (event,template) ->
    event.stopPropagation()
    event.preventDefault()
    $('#cart-drawer-container').fadeOut(300, ()->
      toggleSession "displayCart")

Template.emptyCartDrawer.rendered = ->
  $('#cart-drawer-container').fadeIn()
