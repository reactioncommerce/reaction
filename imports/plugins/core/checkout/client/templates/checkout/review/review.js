import "./review.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import CartSubTotals from "../../../container/cartSubTotalContainer";

/**
* review status
* trigger checkoutPayment step on template checkoutReview render
*/

Template.checkoutReview.onRendered(function () {
  Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutReview");
});

Template.checkoutReview.helpers({
  CartSubTotals() {
    return CartSubTotals;
  }
});
