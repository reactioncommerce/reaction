import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { Orders, Shops } from "/lib/collections";
import { Reaction } from "/client/api";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import CompletedOrder from "../components/completedOrder";

/**
 * @param {Object} props Passed props
 * @param {Function} onData Callback to call with data
 * @returns {undefined}
 */
function composer(props, onData) {
  const cartId = Reaction.Router.getQueryParam("_id");
  const orderSub = Meteor.subscribe("CompletedCartOrder", cartId);

  if (orderSub.ready()) {
    const order = Orders.findOne({ cartId });
    if (!order) {
      onData(null, {
        order: null
      });
      return;
    }

    const imageSub = Meteor.subscribe("OrderImages", order._id);
    if (!imageSub.ready()) {
      onData(null, {
        order: null
      });
      return;
    }

    const orderWithShopNames = {
      ...order,
      shipping: order.shipping.map((group) => {
        const shop = Shops.findOne({ _id: group.shopId });
        return {
          ...group,
          shopName: shop && shop.name
        };
      })
    };

    onData(null, {
      isProfilePage: false,
      order: orderWithShopNames,
      paymentMethods: order.getUniquePaymentMethods()
    });
  }
}

registerComponent("CompletedOrder", CompletedOrder, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(CompletedOrder);
