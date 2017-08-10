import { compose, withProps } from "recompose";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Orders, Media, Shops } from "/lib/collections";
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
  const orderId = Reaction.Router.getQueryParam("_id");
  const orderSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), orderId);

  if (orderSub.ready()) {
    const order = Orders.findOne({
      userId: Meteor.userId(),
      cartId: orderId
    });
    const imageSub = Meteor.subscribe("CartImages", order.items);

    // massage items into an object by Shop
    let itemsByShop = _.sortBy(order.items, function (o) { return o.shopID; });
    itemsByShop = _.groupBy(itemsByShop, function (item) {
      return item.shopId;
    });

    const shopObjects = Object.keys(itemsByShop).map(function (shop) {
      return {
        [shop]: {
          name: Shops.findOne(shop).name,
          items: itemsByShop[shop]
        }
      };
    });

    const orderSummary = {
      quantityTotal: order.orderCount(),
      subtotal: order.orderSubTotal(),
      shipping: order.orderShipping(),
      tax: order.orderTaxes(),
      discounts: order.orderDiscounts(),
      total: order.orderTotal(),
      shippingMethod: order.shipping[0].shipmentMethod.carrier,
      shippingAddress: order.shipping[0].address,
      paymentMethod: "Visa 4111"
    };

    if (imageSub.ready()) {
      const productImages = Media.find().fetch();

      onData(null, {
        shops: shopObjects,
        order,
        orderId,
        orderSummary,
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
