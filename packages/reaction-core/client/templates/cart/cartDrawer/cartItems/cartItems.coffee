Template.cartDrawerItems.rendered = ->
  $ ->
    mySwiper = $(".cart-drawer-swiper-container").swiper(
      mode: "horizontal"
      loop: false
      slidesPerView: "auto"
      wrapperClass: "cart-drawer-swiper-wrapper"
      slideClass: "cart-drawer-swiper-slide"
      slideActiveClass: "cart-drawer-swiper-slide-active"
      pagination: ".cart-drawer-pagination"
      paginationClickable: true
    )
    return

Template.cartDrawerItems.helpers
  media: ->
    # return default image for this product variant
    if defaultImage = ReactionCore.Collections.Media.findOne({'metadata.variantId': @variants._id})
      return defaultImage
    else
      # loop through all product variants attempting to find default image
      product = Products.findOne @productId
      return unless product
      img = null
      _.any product.variants, (v) ->
        img = ReactionCore.Collections.Media.findOne({'metadata.variantId': v._id})
        return !!img
      return img
