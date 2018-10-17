import decodeOpaqueId from "/imports/plugins/core/graphql/lib/utils/decodeOpaqueId";
import getCartItemTrackingData from "./utils/getCartItemTrackingData";

/**
 * @name trackOrder
 * @summary Tracks the "Order Completed" Segment event
 * @param {Object} tracking Tracking prop provided by the withTracking HOC
 * @param {Object} completedOrder Full result from place order mutation
 * @return {undefined} undefined
 */
export default function trackOrder(tracking, completedOrder) {
  const { trackEvent } = tracking;

  const { fulfillmentGroups, _id, shop } = completedOrder;
  const { id } = decodeOpaqueId(_id);
  // Currently only supporting one fulfillment group
  const { items: { nodes: items }, summary } = fulfillmentGroups[0];
  const products = items.map((item) => getCartItemTrackingData(item));

  trackEvent({
    action: "Order Completed",
    currency: shop.currency.code,
    order_id: id, // eslint-disable-line camelcase
    revenue: summary.itemTotal.amount,
    shipping: summary.fulfillmentTotal.amount,
    tax: summary.taxTotal.amount,
    products
  });
}
