import "./review.html";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

/**
* review status
* trigger checkoutPayment step on template checkoutReview render
*/

Template.checkoutReview.onRendered(function () {
  Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutReview");
});
