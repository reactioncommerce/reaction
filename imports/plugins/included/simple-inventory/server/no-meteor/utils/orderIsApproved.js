/**
 * @summary Checks whether the order is approved, i.e., all payments on it
 *   are approved.
 * @param {Object} order The order
 * @return {Boolean} True if approved
 */
export default function orderIsApproved(order) {
  return !Array.isArray(order.payments) ||
    order.payments.length === 0 ||
    !order.payments.find((payment) => payment.status === "created");
}

/**
 * @summary Checks whether the order is complete, i.e., all payments on it
 *   have status equal 'complete'
 * @param {Object} order The order
 * @return {Boolean} True if complete
 */
export function orderIsComplete(order) {
  return !Array.isArray(order.payments) ||
    order.payments.length === 0 ||
    order.payments.find((payment) => payment.status === "completed");
}
