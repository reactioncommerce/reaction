import _ from "lodash";
import { Template } from "meteor/templating";
import getCart from "/imports/plugins/core/cart/client/util/getCart";

/**
 * checkoutProgressBar helpers
 * progressbar status: "visited first","previous visited","active","next"
 */

Template.checkoutProgressBar.helpers({
  progressbarStatusClass() {
    const { cart } = getCart();
    if (!cart) return "";

    const cartWorkflow = cart.workflow;
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
