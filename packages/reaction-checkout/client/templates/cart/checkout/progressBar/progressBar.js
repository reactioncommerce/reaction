/**
 * checkoutProgressBar helpers
 * progressbar status: "visited first","previous visited","active","next"
 */

Template.checkoutProgressBar.helpers({
  progressbarStatusClass: function () {
    const cartWorkflow = ReactionCore.Collections.Cart.findOne().workflow;
    const thisStep = cartWorkflow.status === this.template; // active
    const previouslyVisited = _.contains(cartWorkflow.workflow, this.template);

    if (previouslyVisited === true && thisStep === false) {
      return "visited";
    } else if (thisStep === true) {
      return "visited active";
    }
    return "";
  }
});
