import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import Swiper from "swiper";
import CartSubtotal from "./cartSubTotals/container/cartSubTotalContainer";
import CartItems from "./cartItems/container/cartItemContainer";
/**
 * cartDrawer helpers
 *
 * @provides displayCartDrawer
 * @returns  open or closed cart drawer template
 */

Template.cartDrawer.helpers({
  displayCartDrawer: function () {
    if (!Session.equals("displayCart", true)) {
      return null;
    }

    const storedCart = Cart.findOne();
    let count = 0;

    if (typeof storedCart === "object" && storedCart.items) {
      for (const items of storedCart.items) {
        count += items.quantity;
      }
    }

    if (count === 0) {
      return Template.emptyCartDrawer;
    }
    return Template.openCartDrawer;
  }
});

/**
 * openCartDrawer helpers
 *
 */
Template.openCartDrawer.onRendered(function () {
  /**
   * Add swiper to openCartDrawer
   *
   */

  let swiper;

  $("#cart-drawer-container").fadeIn(() => {
    if (!swiper) {
      swiper = new Swiper(".cart-drawer-swiper-container", {
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
    }
  });
});

Template.openCartDrawer.helpers({
  CartItems() {
    return CartItems;
  },
  CartSubTotals() {
    return CartSubtotal;
  }
});

/**
 * openCartDrawer events
 *
 */
Template.openCartDrawer.events({
  "click #btn-checkout": function () {
    $("#cart-drawer-container").fadeOut();
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
});

/**
 * emptyCartDrawer helpers
 *
 */
Template.emptyCartDrawer.events({
  "click #btn-keep-shopping": function (event) {
    event.stopPropagation();
    event.preventDefault();
    return $("#cart-drawer-container").fadeOut(300, function () {
      return Reaction.toggleSession("displayCart");
    });
  }
});

Template.emptyCartDrawer.onRendered(function () {
  return $("#cart-drawer-container").fadeIn();
});
