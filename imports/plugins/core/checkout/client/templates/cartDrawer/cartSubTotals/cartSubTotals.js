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
  },
  isValid(option) {
    return option > 0 ? true : false;
  }
});
