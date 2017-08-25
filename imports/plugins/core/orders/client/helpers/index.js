import { Reaction } from "/client/api";

/*
 * getOrderRiskBadge - helper - client
 * returns risk level value on the paymentMethod
 * highest = danger; elevated = warning; normal doesn't get a label
 * @param {String} riskLevel - risk level value on the paymentMethod
 * @return {String} label - style color class based on risk level
 */
export function getOrderRiskBadge(riskLevel) {
  let label;
  switch (riskLevel) {
    case "high":
      label = "danger";
      break;
    case "elevated":
      label = "warning";
      break;
    default:
      label = "";
  }
  return label;
}

/*
 * getOrderRiskStatus - helper - client
 * gets the risk label on the paymentMethod object for a shop on an order
 * An empty string is returned if the value is "normal". We don't flag a normal charge
 * @param {Object} order - order object
 * @return {String} label - risklevel value (if risklevel is not normal)
 */
export function getOrderRiskStatus(order) {
  let riskLevel;
  const billingForShop = order.billing.find(
    billing => billing.shopId === Reaction.getShopId()
  );

  if (billingForShop.paymentMethod && billingForShop.paymentMethod.riskLevel) {
    riskLevel = billingForShop.paymentMethod.riskLevel;
  }

  // normal transactions do not need to be flagged
  if (riskLevel === "normal") {
    return "";
  }

  return riskLevel;
}
