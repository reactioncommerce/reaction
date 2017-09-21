import { Reaction } from "/client/api";

/**
 * getBillingInfo
 *
 * @summary get proper billing object as per current active shop
 * @param {Object} order - order object to check against
 * @return {Object} proper billing object to use
 */
export function getBillingInfo(order) {
  const billingInfo = order && order.billing && order.billing.find((billing) => {
    return billing && (billing.shopId === Reaction.getShopId());
  });
  return billingInfo || {};
}

/**
 * getShippingInfo
 *
 * @summary get proper shipping object as per current active shop
 * @param {Object} order - order object to check against
 * @return {Object} proper shipping object to use
 */
export function getShippingInfo(order) {
  const shippingInfo = order && order.shipping && order.shipping.find((shipping) => {
    return shipping && shipping.shopId === Reaction.getShopId();
  });
  return shippingInfo || {};
}
