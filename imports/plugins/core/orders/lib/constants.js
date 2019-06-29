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
