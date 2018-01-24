/**
 * @summary Package name
 * @name PACKAGE_NAME
 * @type {String}
 * @memberof Constants
 * @default
 * @constant
 */
export const PACKAGE_NAME = "reaction-orders";

/**
 * @name ORDER_LIST_FILTERS_PREFERENCE_NAME
 * @summary Preference name for orderList filters when using using Reaction.[get|set]UserPreferences()
 * @type {String}
 * @memberof Constants
 * @default
 * @constant
 */
export const ORDER_LIST_FILTERS_PREFERENCE_NAME = "orderListFilters";

/**
 * @name ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME
 * @summary Preference name for selected order _id when using Reaction.[get|set]UserPreferences()
 * @type {String}
 * @memberof Constants
 * @default
 * @constant
 */
export const ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME = "orderListSelectedOrder";

/**
 * @summary Default filter name
 * @name DEFAULT_FILTER_NAME
 * @type {String}
 * @memberof Constants
 * @default
 * @constant
 */
export const DEFAULT_FILTER_NAME = "new";

/**
 * @name workflowStatus
 * @summary Order workflow states
 * @type {String}
 * @memberof Constants
 * @default
 * @constant
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
 * @name shippingStatus
 * @summary Order workflow states
 * @type {String}
 * @memberof Constants
 * @default
 * @constant
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
 * @name shippingStates
 * @summary Order shipping states
 * @type {String}
 * @memberof Constants
 * @default
 * @constant
 */
export const shippingStates = {
  picked: "Picked",
  packed: "Packed",
  labeled: "Labeled",
  shipped: "Shipped",
  delivered: "Delivered"
};
