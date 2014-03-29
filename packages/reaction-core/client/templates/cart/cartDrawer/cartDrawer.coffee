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

Template.openCartDrawer.rendered = ->
  console.log "rendering cart drawer"
  this.$(".cart-drawer-carousel").owlCarousel
    itemsCustom : [
      [0, 1],
      [450, 2]
      [675, 3]
      [1000, 4]
      [1200, 5]
      [1440, 6]
      [1650, 7]
      [1900, 8]
      [2200, 9]
      [2400, 10]
    ]

Template.openCartDrawer.reinit = () ->
  this.$(".cart-drawer-carousel").data('owlCarousel').reinit()


Template.openCartDrawer.events
  'click #btn-checkout': (event,template) ->
    Session.set "displayCart", false
    CartWorkflow.checkout()

  'click .remove-cart-item': (event,template) ->
    event.stopPropagation()
    event.preventDefault()
    currentCartId = Cart.findOne()._id
    currentVariant = this.variants
    item = '#'+$(event.currentTarget).attr('data-target')
    $(item).fadeOut(1500).delay 1500, ()->
      Meteor.call('removeFromCart',currentCartId,currentVariant)

  'click #btn-keep-shopping': (event,template) ->
    event.stopPropagation()
    event.preventDefault()
    toggleSession "displayCart"

  'click #cart-drawer-container': (event, template) ->
    Meteor.clearTimeout(delayId) if delayId?
