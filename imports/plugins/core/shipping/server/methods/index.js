import getShippingRates from "./getShippingRates";
import providerToggle from "./providerToggle";
import statusRefresh from "./statusRefresh";
import updateParcelSize from "./updateParcelSize";
import updateShipmentQuotes from "./updateShipmentQuotes";

/**
 * @file Methods for Shipping - methods typically used for checkout (shipping, taxes, etc).
 * Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Shipping/Methods
*/

export default {
  "shipping/getShippingRates": getShippingRates,
  "shipping/provider/toggle": providerToggle,
  "shipping/status/refresh": statusRefresh,
  "shipping/updateParcelSize": updateParcelSize,
  "shipping/updateShipmentQuotes": updateShipmentQuotes
};


