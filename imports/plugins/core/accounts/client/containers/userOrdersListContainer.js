import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";
import { Router } from "/client/modules/router/";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import OrdersList from "../components/ordersList";

/**
 * @summary Composer
 * @param {Object} props Provided props
 * @param {Function} onData Call this with props
 * @returns {undefined}
 */
function composer(props, onData) {
  // Get user order from props
  const { orders } = props;

  const allOrdersInfo = (orders || []).reduce((list, order) => {
    const imageSub = Meteor.subscribe("OrderImages", order._id);
    if (imageSub.ready()) {
      list.push({
        // Add `shopName` to each group in the orders. Needed by `CompletedShopOrders` component.
        order: {
          ...order,
          shipping: order.shipping.map((group) => {
            const shop = Shops.findOne({ _id: group.shopId });
            return {
              ...group,
              shopName: shop && shop.name
            };
          })
        },
        orderId: order._id,
        paymentMethods: order.getUniquePaymentMethods()
      });
    }
    return list;
  }, []);

  onData(null, {
    allOrdersInfo,
    isProfilePage: (Router.getRouteName() === "account/profile")
  });
}

registerComponent("OrdersList", OrdersList, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(OrdersList);
