import Swiper from "swiper";
import { Media, Products } from "/lib/collections";

/**
 * Add swiper to cartDrawerItems
 *
 */
Template.cartDrawerItems.onRendered(function () {
  const swiper = new Swiper(".cart-drawer-swiper-container", {
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

  return swiper;
});

/**
 * cartDrawerItems helpers
 *
 * @provides media
 * @returns default product image
 */
Template.cartDrawerItems.helpers({
  product: function () {
    return Products.findOne(this.productId);
  },
  media: function () {
    let product = Products.findOne(this.productId);
    let defaultImage = Media.findOne({
      "metadata.variantId": this.variants._id
    });

    if (defaultImage) {
      return defaultImage;
    } else if (product) {
      _.any(product.variants, function (variant) {
        defaultImage = Media.findOne({
          "metadata.variantId": variant._id
        });
        return !!defaultImage;
      });
    }
    return defaultImage;
  }
});
