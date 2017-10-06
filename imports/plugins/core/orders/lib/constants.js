/**
 * Package name
 * @type {String}
 */
export const PACKAGE_NAME = "reaction-orders";

/**
 * Preference name for orderList filters when using using Reaction.[get|set]UserPreferences()
 * @type {String}
 */
export const ORDER_LIST_FILTERS_PREFERENCE_NAME = "orderListFilters";

/**
 * Preference name for selected order _id when using Reaction.[get|set]UserPreferences()
 * @type {String}
 */
export const ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME = "orderListSelectedOrder";

/**
 * Default filter name
 * @type {String}
 */
export const DEFAULT_FILTER_NAME = "new";


/**
 * Order workflow states
 * @type {String}
 */
export const workflowStatus = [{
  label: "New",
  value: "new"
}, {
  label: "Approved",
  value: "approved"
}, {
  label: "Captured",
  value: "captured"
}, {
  label: "Processing",
  value: "processing"
}, {
  label: "Completed",
  value: "completed"
}, {
  label: "Canceled",
  value: "canceled"
}];

/**
 * Order workflow states
 * @type {String}
 */
export const shippingStatus = [{
  label: "Picked",
  value: "picked"
}, {
  label: "Packed",
  value: "packed"
}, {
  label: "Labeled",
  value: "labeled"
}, {
  label: "Shipped",
  value: "shipped"
}];

/**
 * Order shipping states
 * @type {String}
 */
export const shippingStates = {
  picked: "Picked",
  packed: "Packed",
  labeled: "Labeled",
  shipped: "Shipped",
  delivered: "Delivered"
};
