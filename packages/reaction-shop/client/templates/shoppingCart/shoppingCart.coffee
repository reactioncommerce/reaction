Template.shopCartIcon.helpers
  cartCount: ->
    count = 0
    if Session.get('serverSession')
      currentCart = Cart.findOne()
    if currentCart and currentCart.items
      for items in currentCart.items
        count += items.quantity
    return count

Template.shopCartIconList.helpers
  cartList: ->
    currentCart = Cart.findOne()
    if currentCart
      return currentCart.items


Template.shopCartSlide.helpers
  cartItems: ->
    currentCart = Cart.findOne()
    if currentCart
      return currentCart.items

  image:(variantId)->
    getVariantImage(variantId)


Template.shopCartSlide.rendered = ->
  $(".owl-carousel").owlCarousel
    items: 5
    lazyLoad : true
    responsive: true
    itemsCustom : false
    itemsDesktop : [1199,4]
    itemsDesktopSmall : [980,3]
    itemsTablet: [768,2]
    itemsTabletSmall: false
    itemsMobile : [479,1]
    singleItem : false
    itemsScaleUp : false

Template.shopCartSlide.events
  'click #btn-checkout': () ->
    $("#shop-cart-slide").fadeOut( 100 )
