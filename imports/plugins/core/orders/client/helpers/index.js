import { Reaction } from "/client/api";

/*
 * @method getOrderRiskBadge
 * @private
 * @summary Selects appropriate color badge (e.g  danger, warning) value based on risklevel
 * @param {string} riskLevel - risk level value on the paymentMethod
 * @return {string} label - style color class based on risk level
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
 * @method getOrderRiskStatus
 * @private
 * @summary Gets the risk label on the paymentMethod object for a shop on an order.
 * An empty string is returned if the value is "normal" becuase we don't flag a normal charge
 * @param {object} order - order object
 * @return {string} label - risklevel value (if risklevel is not normal)
 */
export function getOrderRiskStatus(order) {
  let riskLevel;
  const billingForShop = order.billing.find((billing) => billing.shopId === Reaction.getShopId());

  if (billingForShop.paymentMethod && billingForShop.paymentMethod.riskLevel) {
    riskLevel = billingForShop.paymentMethod.riskLevel;
  }

  // normal transactions do not need to be flagged
  if (riskLevel === "normal") {
    return "";
  }

  return riskLevel;
}
