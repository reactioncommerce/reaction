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

  if (billingForShop && billingForShop.paymentMethod && billingForShop.paymentMethod.riskLevel) {
    riskLevel = billingForShop.paymentMethod.riskLevel;
  }

  // normal transactions do not need to be flagged
  if (riskLevel === "normal") {
    return "";
  }

  if (!riskLevel) {
    return "";
  }

  return riskLevel;
}

export function filterWorkflowStatus(filter) {
  let query = {};

  switch (filter) {
    // New orders
    case "new":
      query = {
        "workflow.status": "new"
      };
      break;

    // Orders that have been approved
    case "approved":
      query = {
        "workflow.status": "coreOrderWorkflow/processing",
        "billing.paymentMethod.status": "approved"
      };
      break;

    // Orders that have been captured
    case "captured":
      query = {
        "billing.paymentMethod.status": "completed",
        "shipping.shipped": false
      };
      break;

    // Orders that are being processed
    case "processing":
      query = {
        "workflow.status": "coreOrderWorkflow/processing"
      };
      break;

    // Orders that are complete, including all items with complete status
    case "completed":
      query = {
        "workflow.status": "coreOrderWorkflow/completed"
      };
      break;

    case "canceled":
      query = {
        "workflow.status": "coreOrderWorkflow/canceled"
      };
      break;

    default:
  }

  return query;
}

export function filterShippingStatus(filter) {
  let query = {};

  switch (filter) {
    case "picked":
      query = {
        "shipping.workflow.status": "coreOrderWorkflow/picked"
      };
      break;

    case "packed":
      query = {
        "shipping.workflow.status": "coreOrderWorkflow/packed"
      };
      break;

    case "labeled":
      query = {
        "shipping.workflow.status": "coreOrderWorkflow/labeled"
      };
      break;

    case "shipped":
      query = {
        "shipping.workflow.status": "coreOrderWorkflow/shipped"
      };
      break;

    default:
  }

  return query;
}
