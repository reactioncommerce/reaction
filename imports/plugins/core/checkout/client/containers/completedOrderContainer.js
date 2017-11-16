import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Orders, Media } from "/lib/collections";
import { Reaction } from "/client/api";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import CompletedOrder from "../components/completedOrder";


const handlers = {};

handlers.handleDisplayMedia = (item) => {
  const variantId = item.variants._id;
  const productId = item.productId;

  const variantImage = Media.findOne({
    "metadata.variantId": variantId,
    "metadata.productId": productId
  });

  if (variantImage) {
    return variantImage;
  }

  const defaultImage = Media.findOne({
    "metadata.productId": productId,
    "metadata.priority": 0
  });

  if (defaultImage) {
    return defaultImage;
  }
  return false;
};

function composer(props, onData) {
  // The Cart subscription does not update when you delete the original record
  // but don't change parameters so we need to re-init that subscription here.
  // (possibly because the oplog is tied to the original id?)
  // I think this is a bug in SubscriptionManager but that should be revisited later
  const sessionId = Session.get("sessionId");
  Reaction.Subscriptions.Cart = Reaction.Subscriptions.Manager.subscribe("Cart", sessionId, Meteor.userId());
  const orderId = Reaction.Router.getQueryParam("_id");
  const orderSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), orderId);

  if (orderSub.ready()) {
    const order = Orders.findOne({
      userId: Meteor.userId(),
      cartId: orderId
    });

    if (order) {
      const imageSub = Meteor.subscribe("CartImages", order.items);

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
        const productImages = Media.find().fetch();

        onData(null, {
          isProfilePage: false,
          shops: order.getShopSummary(),
          order,
          orderId,
          orderSummary,
          paymentMethods: order.getUniquePaymentMethods(),
          productImages
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
  withProps(handlers),
  composeWithTracker(composer)
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(CompletedOrder);
