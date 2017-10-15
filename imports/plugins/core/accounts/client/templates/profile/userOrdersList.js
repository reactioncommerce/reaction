import { Template } from "meteor/templating";
import { Orders, Media } from "/lib/collections";
import CompletedOrder from "/imports/plugins/core/checkout/client/components/completedOrder";

/**
 * @method handleDisplayMedia
 * @summary gets the image of an order variant
 * @param {object} order - order from which variant is gotten
 * @since 1.5.0
 * @return {func} handleDisplayMedia - function to be passed a props to
 * CompletedOrder component
 */
function handleDisplayMedia(order) {
  return () => {
    const item = order.items[0];
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
}

/**
 * userOrdersList helpers
 *
 */
Template.userOrdersList.helpers({
  orders(data) {
    if (data.hash.data) {
      return data.hash.data;
    }
    const orders = Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    });
    return orders;
  },

  // Returns React Component
  completedOrder() {
    const order = this;
    const orderId = order._id;
    const orderSummary = {
      quantityTotal: order.getCount(),
      subtotal: order.getSubTotal(),
      shippingTotal: order.getShippingTotal(),
      tax: order.getTaxTotal(),
      discounts: order.getDiscounts(),
      total: order.getTotal(),
      shipping: order.shipping
    };
    const paymentMethods = order.getUniquePaymentMethods();
    const shops = order.getShopSummary();
    return { component: CompletedOrder,
      handleDisplayMedia: handleDisplayMedia(order),
      order: order,
      orderId: orderId,
      orderSummary: orderSummary,
      paymentMethods: paymentMethods,
      shops: shops
    };
  }
});
