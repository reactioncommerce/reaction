import { Reaction } from "/client/api";

/**
 * @method getOrderRiskBadge
 * @private
 * @summary Selects appropriate color badge (e.g  danger, warning) value based on risk level
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

/**
 * @method getOrderRiskStatus
 * @private
 * @summary Gets the risk label on the paymentMethod object for a shop on an order.
 * An empty string is returned if the value is "normal" because we don't flag a normal charge
 * @param {object} order - order object
 * @return {string} label - risk level value (if risk level is not normal)
 */
export function getOrderRiskStatus(order) {
  const billingForShop = order.billing.find((billing) => billing.shopId === Reaction.getShopId());
  const paymentMethod = (billingForShop && billingForShop.paymentMethod) || {};
  const { riskLevel } = paymentMethod;

  // normal transactions do not need to be flagged
  if (riskLevel === "normal") {
    return "";
  }

  if (!riskLevel) {
    return "";
  }

  return riskLevel;
}

/**
 * @method getTaxRiskStatus
 * @private
 * @summary Gets the tax status of the order.
 * @param {object} order - order object
 * @return {boolean} label - true if the tax was not submitted by user.
 */
export function getTaxRiskStatus(order) {
  return order.taxCalculationFailed || order.bypassAddressValidation;
}

/**
 * @name filterWorkflowStatus
 * @method
 * @memberof Helpers
 * @summary get query for a given filter
 * @param {String} filter - filter string to check against
 * @return {Object} query for the workflow status
 */
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

/**
 * @name filterShippingStatus
 * @memberof Helpers
 * @summary get query for a given filter
 * @param {String} filter - filter string to check against
 * @return {Object} query for the shipping status
 */
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

/**
 * @name getBillingInfo
 * @memberof Helpers
 * @summary get proper billing object as per current active shop
 * @param {Object} order - order object to check against
 * @return {Object} proper billing object to use
 */
export function getBillingInfo(order) {
  const billingInfo = order && order.billing && order.billing.find((billing) => billing && (billing.shopId === Reaction.getShopId()));
  return billingInfo || {};
}

/**
 * @name getShippingInfo
 * @memberof Helpers
 * @summary get proper shipping object as per current active shop
 * @param {Object} order - order object to check against
 * @return {Object} proper shipping object to use
 */
export function getShippingInfo(order) {
  const shippingInfo = order && order.shipping && order.shipping.find((shipping) => shipping && shipping.shopId === Reaction.getShopId());
  return shippingInfo || {};
}
