import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name orderCreditMethod
 * @method
 * @memberof Orders/Methods
 * @summary Helper to return the order credit object.
 * Credit paymentMethod on the order as per current active shop
 * @param  {Object} order order object
 * @return {Object} returns entire payment method
 */
export default function orderCreditMethod(order) {
  const creditBillingRecords = order.billing.filter((value) => value.paymentMethod.method === "credit");
  const billingRecord = creditBillingRecords.find((billing) => billing.shopId === Reaction.getShopId());
  return billingRecord;
}
