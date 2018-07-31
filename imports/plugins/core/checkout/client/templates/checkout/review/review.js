import "./review.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import CartSubTotals from "../../../containers/cartSubTotalContainer";

/**
* review status
* trigger checkoutPayment step on template checkoutReview render
*/

Template.checkoutReview.onRendered(() => {
  const { cart } = getCart();
  if (cart) {
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutReview", cart._id);
  }
});

Template.checkoutReview.helpers({
  CartSubTotals() {
    return CartSubTotals;
  }
});
