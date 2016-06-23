import { Cart } from "/lib/collections";
import "./progressBar.html";
import { _ } from "lodash";


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
