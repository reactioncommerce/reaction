import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import { Router } from "/client/modules/router/";
import { Media } from "/lib/collections";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import OrdersList from "../components/ordersList";


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
  const orders = props.orders;
  const allOrdersInfo = [];
  let isProfilePage = false;

  if (Router.getRouteName() === "account/profile") {
    isProfilePage = true;
  }

  if (orders.length > 0) {
    orders.map((order) => {
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
        const orderInfo = {
          shops: order.getShopSummary(),
          order,
          orderId,
          orderSummary,
          paymentMethods: order.getUniquePaymentMethods(),
          productImages
        };
        allOrdersInfo.push(orderInfo);
      }
    });
    onData(null, {
      allOrdersInfo,
      isProfilePage
    });
  } else {
    onData(null, {
      orders,
      isProfilePage
    });
  }
}


registerComponent("OrdersList", OrdersList, [
  withProps(handlers),
  composeWithTracker(composer)
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(OrdersList);
