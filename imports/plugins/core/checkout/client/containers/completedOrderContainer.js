import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Orders } from "/lib/collections";
import { Reaction } from "/client/api";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import CompletedOrder from "../components/completedOrder";

function composer(props, onData) {
  // The Cart subscription does not update when you delete the original record
  // but don't change parameters so we need to re-init that subscription here.
  // (possibly because the oplog is tied to the original id?)
  // I think this is a bug in SubscriptionManager but that should be revisited later
  const sessionId = Session.get("sessionId");
  Reaction.Subscriptions.Cart = Reaction.Subscriptions.Manager.subscribe("Cart", sessionId, Meteor.userId());
  const cartId = Reaction.Router.getQueryParam("_id");
  const orderSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), cartId);

  if (orderSub.ready()) {
    const order = Orders.findOne({
      userId: Meteor.userId(),
      cartId
    });

    if (order) {
      const imageSub = Meteor.subscribe("OrderImages", order._id);

      const orderSummary = {
        quantityTotal: order.getCount(),
        subtotal: order.getSubTotal(),
        shippingTotal: order.getShippingTotal(),
        tax: order.getTaxTotal(),
        discounts: order.getDiscounts(),
        total: order.getTotal(),
        shipping: order.shipping
      };

      if (imageSub.ready()) {
        onData(null, {
          isProfilePage: false,
          shops: order.getShopSummary(),
          order,
          orderSummary,
          paymentMethods: order.getUniquePaymentMethods()
        });
      }
    } else {
      onData(null, {
        order
      });
    }
  }
}

registerComponent("CompletedOrder", CompletedOrder, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(CompletedOrder);
