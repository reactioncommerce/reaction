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
    defaultImage = Media.findOne({'metadata.variantId': this.variants._id})
    if defaultImage
      return defaultImage
    else
      return false