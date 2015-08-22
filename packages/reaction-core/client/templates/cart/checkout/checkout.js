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
  cart: function() {
    return Cart.findOne();
  }
});

Template.cartCheckout.onRendered(function () {
  // ensure checkout drawer does not display
  Session.set("displayCartDrawer", false);
});


Template.checkoutStepBadge.helpers({
  "position": function () {
    var workflowStep = Template.parentData(2).data;
    /*console.log("Workflow Position", workflowStep);*/
    return workflowStep.position;
  },

  "status": function () {
    var workflowStep = Template.parentData(2).data;
    var currentStatus = ReactionCore.Collections.Cart.findOne().status;

    if (workflowStep.status === true && currentStatus != workflowStep.workflow)
    {
      return "completed";
    } else {
      return "active";
    }

  }
});
