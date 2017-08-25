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
    case "highest":
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

export function getOrderRiskStatus(order) {
  const billingForShop = order.billing.find(
    billing => billing.shopId === Reaction.getShopId()
  );

  if (billingForShop.paymentMethod && billingForShop.paymentMethod.riskLevel) {
    return billingForShop.paymentMethod.riskLevel;
  }

  return "";
}
