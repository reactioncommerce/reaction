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
  media: (variant) ->
     # return default image for this product variant
     if defaultImage = Media.findOne({'metadata.variantId': this.variants._id})
       return defaultImage
     else
       # loop through all product variants attempting to find default image
       for variant in Products.findOne(this.productId).variants
         if img = Media.findOne({'metadata.variantId': variant._id})
             return img
     # no images for this product or 'this is why we cant have nice things'
     return false
