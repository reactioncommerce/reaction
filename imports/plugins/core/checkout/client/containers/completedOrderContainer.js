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
}

function composer(props, onData) {
  const orderId = Reaction.Router.getQueryParam("_id");
  const orderSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), orderId);
  const shopSub = Meteor.subscribe("Shops");

  if (orderSub.ready() && shopSub.ready()) {
    const order = Orders.findOne({
      userId: Meteor.userId(),
      cartId: orderId
    });
    const imageSub = Meteor.subscribe("CartImages", order.items);

    let itemsByShop = _.sortBy(order.items, function (o) { return o.shopID; });
    itemsByShop = itemsByShop.map(function (item) {
      item.shopName = Shops.findOne(item.shopId).name;
      return item;
    });
    console.log("itemsByShop", itemsByShop);
    const orderSummary = {
      quantityTotal: order.orderCount(),
      subtotal: order.orderSubTotal(),
      shipping: order.orderShipping(),
      tax: order.orderTaxes(),
      discounts: order.orderDiscounts(),
      total: order.orderTotal()
    };

    if (imageSub.ready()) {
      const productImages = Media.find().fetch();

      onData(null, {
        items: itemsByShop,
        order,
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
