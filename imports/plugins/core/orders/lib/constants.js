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
 * Order filters
 * @type {String}
 */
export const orderFilters = [{
  name: "new",
  label: "New"
}, {
  name: "processing",
  label: "Processing"
}, {
  name: "completed",
  label: "Completed"
}, {
  name: "canceled",
  label: "Canceled"
}];
