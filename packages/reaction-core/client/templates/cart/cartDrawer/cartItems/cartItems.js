/**
 * Add swiper to cartDrawerItems
 *
 */
Template.cartDrawerItems.onRendered(function() {
  return $(function() {
    var mySwiper;
    mySwiper = $(".cart-drawer-swiper-container").swiper({
      direction: "horizontal",
      setWrapperSize: true,
      loop: false,
      grabCursor: true,
      slidesPerView: "auto",
      wrapperClass: "cart-drawer-swiper-wrapper",
      slideClass: "cart-drawer-swiper-slide",
      slideActiveClass: "cart-drawer-swiper-slide-active",
      pagination: ".cart-drawer-pagination",
      paginationClickable: true
    });
  });
});

/**
 * cartDrawerItems helpers
 *
 * @provides media
 * @returns default product image
 */
Template.cartDrawerItems.helpers({
  media: function() {
    var defaultImage, img, product;
    if (defaultImage = ReactionCore.Collections.Media.findOne({
      'metadata.variantId': this.variants._id
    })) {
      return defaultImage;
    } else {
      product = Products.findOne(this.productId);
      if (!product) {
        return;
      }
      img = null;
      _.any(product.variants, function(v) {
        img = ReactionCore.Collections.Media.findOne({
          'metadata.variantId': v._id
        });
        return !!img;
      });
      return img;
    }
  }
});
