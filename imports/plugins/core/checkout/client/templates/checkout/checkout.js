import _ from "lodash";
import Logger from "/client/modules/logger";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import "./checkout.html";

//
// cartCheckout is a wrapper template
// controlling the load order of checkout step templates
//

Template.cartCheckout.helpers({
  cart() {
    const { cart } = getCart();
    return cart;
  },
  cartHasItems() {
    const { cart } = getCart();
    return (cart && cart.items && cart.items.length > 0) || false;
  },
  isSubmittingCheckoutPayment: () => Reaction.isSubmittingCheckoutPayment
});


Template.cartCheckout.onCreated(function onCreated() {
  let previousCartShipping;
  this.autorun(() => {
    const { cart, token } = getCart();
    if (cart && cart.workflow && cart.workflow.status === "new") {
      // if user logged in as normal user, we must pass it through the first stage
      Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin", cart._id);
    }

    if (cart) {
      const partialShipping = (cart.shipping || [])
        .filter((group) => group.type === "shipping")
        .map(({ _id, address, itemIds, shopId, type }) => ({ _id, address, itemIds, shopId, type }));
      if (!_.isEqual(previousCartShipping, partialShipping)) {
        previousCartShipping = partialShipping;

        const methodInput = [{ namespace: "Cart", id: cart._id }];
        partialShipping.forEach(({ _id }) => {
          methodInput.push({ namespace: "FulfillmentGroup", id: _id });
        });

        Meteor.call("getOpaqueIdFromInternalId", methodInput, (error, opaqueIds) => {
          if (error || !opaqueIds) {
            Logger.error(error || "No opaque IDs returned");
            return;
          }
          const [opaqueCartId, ...opaqueGroupIds] = opaqueIds;

          opaqueGroupIds.forEach((fulfillmentGroupId) => {
            simpleGraphQLClient.mutations.updateFulfillmentOptionsForGroup({
              input: {
                cartId: opaqueCartId,
                cartToken: token,
                fulfillmentGroupId
              }
            });
          });
        });
      }
    }
  });
});

/**
 * checkoutSteps Helpers
 * helper isPending evaluates that this is
 * the current step, or has been processed already
 */
Template.checkoutSteps.helpers({
  isCompleted() {
    return this.status === true;
  },

  isPending() {
    if (this.status === this.template) {
      return this.status;
    }
    return false;
  }
});

/**
 * checkoutStepBadge Helpers
 */
Template.checkoutStepBadge.helpers({
  checkoutStepBadgeClass() {
    const workflowStep = Template.instance().data;
    if (workflowStep.status === true || workflowStep.status === this.template) {
      return "active";
    }
    return "";
  }
});
