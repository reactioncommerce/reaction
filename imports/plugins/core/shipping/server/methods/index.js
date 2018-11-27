import statusRefresh from "./statusRefresh";

/**
 * @file Methods for Shipping - methods typically used for checkout (shipping, taxes, etc).
 * Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Shipping/Methods
*/

export default {
  "shipping/status/refresh": statusRefresh
};


