/**
 * @name "Order.orderStatus"
 * @method
 * @memberof Order/GraphQL
 * @summary Displays a human readable status of order state
 * @param {Object} order - Result of the parent resolver, which is a Order object in GraphQL schema format
 * @return {String} A string of the order status
 */
export default async function orderStatus(order) {
  const { workflow: { status } } = order;

  if (status === "new") {
    return {
      label: "Order received",
      type: "new"
    };
  }

  if (status === "coreOrderWorkflow/processing") {
    return {
      label: "Order received",
      type: "processing"
    };
  }

  if (status === "coreOrderWorkflow/completed") {
    return {
      label: "Shipped",
      type: "shipped"
    };
  }

  if (status === "coreOrderWorkflow/canceled") {
    return {
      label: "Canceled",
      type: "canceled"
    };
  }

  return {
    label: status,
    type: status
  };
}
