import { Cart } from "/lib/collections";
import { Template } from "meteor/templating";

/**
 * cartSubTotals helpers
 *
 * @returns cart
 */
Template.cartSubTotals.helpers({
  cart() {
    return Cart.findOne();
  }
});
