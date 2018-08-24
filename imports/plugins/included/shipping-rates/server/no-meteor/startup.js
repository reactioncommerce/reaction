import getShippingPrices from "./getShippingPrices";

/**
 * @summary Runs on app startup
 * @returns {undefined}
 */
export default function startup({ registerFunction }) {
  registerFunction("getShippingPrices", getShippingPrices);
}
