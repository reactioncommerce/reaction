import { compose, withProps } from "recompose";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import { Reaction } from "/client/api";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import CompletedOrder from "../components/completedOrder";


const handlers = {};

function composer(props, onData) {
  const orderId = Reaction.Router.getQueryParam("_id");
  const orderSub = Meteor.subscribe("CompletedCartOrder", Meteor.userId(), orderId);

  if (orderSub.ready()) {
    const order = Orders.findOne({
      userId: Meteor.userId(),
      cartId: orderId
    });

    const itemsByShop = _.sortBy(order.items, function (o) { return o.shopID; });
    const orderSummary = {
      quantityTotal: order.orderCount(),
      subtotal: order.orderSubTotal(),
      shipping: order.orderShipping(),
      tax: order.orderTaxes(),
      discounts: order.orderDiscounts(),
      total: order.orderTotal()
    };

    onData(null, {
      items: itemsByShop,
      order,
      orderSummary
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
