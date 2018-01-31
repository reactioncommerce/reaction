import "./review.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import CartSubTotals from "../../../containers/cartSubTotalContainer";

/**
* review status
* trigger checkoutPayment step on template checkoutReview render
*/

Template.checkoutReview.onRendered(() => {
  Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutReview");
});

Template.checkoutReview.helpers({
  CartSubTotals() {
    return CartSubTotals;
  }
});
