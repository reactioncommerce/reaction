import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders, Media } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
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

handlers.addEmail = (email) => {
  check(email, String);
  const cartId = Reaction.Router.getQueryParam("_id");

  return Meteor.call("orders/addOrderEmail", cartId, email, (err) => {
    if (err) {
      Alerts.toast(i18next.t("mail.alerts.cantSendEmail"), "error");
    } else {
      const order = Orders.findOne({
        userId: Meteor.userId(),
        cartId: Reaction.Router.getQueryParam("_id")
      });
      Meteor.call("orders/sendNotification", order);
    }
  });
}

function composer(props, onData) {
  const orderId = Reaction.Router.getQueryParam("_id");
  const orderSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), orderId);

  if (orderSub.ready()) {
    const order = Orders.findOne({
      userId: Meteor.userId(),
      cartId: orderId
    });
    const imageSub = Meteor.subscribe("CartImages", order.items);



    const orderSummary = {
      quantityTotal: order.orderCount(),
      subtotal: order.orderSubTotal(),
      shipping: order.orderShipping(),
      tax: order.orderTaxes(),
      discounts: order.orderDiscounts(),
      total: order.orderTotal(),
      shippingMethod: order.shipping[0].shipmentMethod.carrier,
      shippingAddress: order.shipping[0].address
    };

    if (imageSub.ready()) {
      const productImages = Media.find().fetch();

      onData(null, {
        shops: order.itemsByShop(),
        order,
        orderId,
        orderSummary,
        paymentMethods: order.paymentMethods(),
        productImages
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
