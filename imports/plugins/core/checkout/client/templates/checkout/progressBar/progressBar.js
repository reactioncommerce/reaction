import _ from "lodash";
import { Cart } from "/lib/collections";
import { Template } from "meteor/templating";

/**
 * checkoutProgressBar helpers
 * progressbar status: "visited first","previous visited","active","next"
 */

Template.checkoutProgressBar.helpers({
  progressbarStatusClass() {
    const cartWorkflow = Cart.findOne().workflow;
    const thisStep = cartWorkflow.status === this.template; // active
    const previouslyVisited = _.includes(cartWorkflow.workflow, this.template);

    if (previouslyVisited === true && thisStep === false) {
      return "visited";
    } else if (thisStep === true) {
      return "visited active";
    }
    return "";
  }
});
