import { Reaction } from "/client/api";

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
  const paymentMethod = order.billings[Reaction.getShopId()].paymentMethod; // temp

  if (paymentMethod && paymentMethod.riskLevel) {
    return paymentMethod.riskLevel;
  }

  return "";
}
