Session.setDefault "displayCartDrawer",false
### **************************************************************
# true = cartDrawer should be open (persistent, until closed)
# false = cartDrawer is closed and not rendered
# usage:
#  toggleCartDrawer(true) to display, on next invocation
#  toggleCartDrawer() to open if closed, keep open if already open
# ************************************************************ ###
@toggleCartDrawer = (toggle) ->
  cartVisibility = Session.get "displayCartDrawer"
  if cartVisibility is false
    Session.set "displayCartDrawer", true
  else if cartVisibility is true and delayId? is true and toggle? isnt true
    Session.set "displayCartDrawer", true
  else
    Session.set "displayCartDrawer", false

  $('html, body').animate({ scrollTop: 0 }, 0)

  autoClose = () ->
    $("#cart-drawer").fadeOut "slow", () ->
      Session.set "displayCartDrawer", false
  Meteor.clearTimeout(delayId) if delayId?
  @delayId = Meteor.setTimeout autoClose, 8000

### **************************************************************
# Template Cart Drawer
# ************************************************************ ###
Template.cartDrawer.helpers
  cartItems: ->
    currentCart = Cart.findOne()
    items = (cart for cart in currentCart.items by -1) if currentCart?.items
    items
  checkoutView: ->
    checkoutView = "display:block"
    if Router.current().route.name is 'cartCheckout' then checkoutView
  displayCartDrawer: ->
    Session.get "displayCartDrawer"

Template.cartDrawer.rendered = ->
  $(".owl-carousel").owlCarousel
    lazyload: true
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

Template.cartDrawer.events
  'click #btn-checkout': (event,template) ->
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
    toggleCartDrawer(true)

  'click #cart-drawer-container': (event, template) ->
    Meteor.clearTimeout(delayId) if delayId?
