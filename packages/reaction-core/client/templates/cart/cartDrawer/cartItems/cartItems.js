/**
 * Add swiper to cartDrawerItems
 *
 */
Template.cartDrawerItems.onRendered(function () {
  return $(function () {
    return $(".cart-drawer-swiper-container").swiper({
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
  media: function () {
    let product = ReactionCore.Collections.Products.findOne(this.productId);
    let defaultImage = ReactionCore.Collections.Media.findOne({
      "metadata.variantId": this.variants._id
    });

    if (defaultImage) {
      return defaultImage;
    } else if (product) {
      _.any(product.variants, function (variant) {
        defaultImage = ReactionCore.Collections.Media.findOne({
          "metadata.variantId": variant._id
        });
        return !!defaultImage;
      });
    }
    return defaultImage;
  }
});
