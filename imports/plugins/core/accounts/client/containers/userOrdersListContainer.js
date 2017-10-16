import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import { Media } from "/lib/collections";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import CompletedOrder from "../../../checkout/client/components/completedOrder";

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
  // Get user order from props
  const order = props.order;

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
      const orderId = order._id;
      onData(null, {
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


registerComponent("CompletedOrder", CompletedOrder, [
  withProps(handlers),
  composeWithTracker(composer)
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(CompletedOrder);
