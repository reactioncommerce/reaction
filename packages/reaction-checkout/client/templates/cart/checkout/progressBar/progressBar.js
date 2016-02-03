/**
 * checkoutProgressBar helpers
 * progressbar status: "visited first","previous visited","active","next"
 */

Template.checkoutProgressBar.helpers({
  progressbarStatusClass: function () {
    var cartWorkflow = ReactionCore.Collections.Cart.findOne().workflow;
    var thisStep = (cartWorkflow.status === this.template); // active
    var previouslyVisited = _.contains(cartWorkflow.workflow, this.template);

    if (previouslyVisited === true && thisStep === false) {
      return "visited";
    } else if (thisStep === true) {
      return "visited active";
    } else {
      return "";
    }

  }
});
