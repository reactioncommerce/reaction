//
// cartCheckout is a wrapper template
// controlling the load order of checkout step templates
//
//
// If you are looking for:
//  - cartWorkflow
//  - cartWorkflowPosition
//  - cartWorkflowCompleted
// see helpers/cart.coffee
//

Template.cartCheckout.helpers({
  cart: function () {
    return ReactionCore.Collections.Cart.findOne();
  }
});

Template.cartCheckout.onRendered(function () {
  // ensure checkout drawer does not display
  Session.set("displayCartDrawer", false);
  // init cart workflow
  if (ReactionCore.Collections.Cart.findOne().workflow.status === "new") {
    // if user logged in as normal user, we must pass it through the first stage
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow",
      "checkoutLogin");
  }
});

/**
 * checkoutSteps Helpers
 * helper isPending evaluates that this is
 * the current step, or has been processed already
 *
 */
Template.checkoutSteps.helpers({
  isCompleted: function () {
    if (this.status === true) {
      return this.status;
    }
    return false;
  },

  isPending: function () {
    if (this.status === this.template) {
      return this.status;
    }
    return false;
  }
});

/**
 * checkoutStepBadge Helpers
 *
 */

Template.checkoutStepBadge.helpers({
  checkoutStepBadgeClass: function () {
    let workflowStep = Template.instance().data;
    // let currentStatus = ReactionCore.Collections.Cart.findOne().workflow.status;
    if (workflowStep.status === true || workflowStep.status === this.template) {
      return "active";
    }
    return "";
  }
});
