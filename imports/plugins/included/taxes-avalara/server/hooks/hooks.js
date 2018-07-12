import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import MethodHooks from "/imports/plugins/core/core/server/method-hooks";
import { Cart, Orders } from "/lib/collections";
import taxCalc from "../methods/taxCalc";

function linesToTaxes(lines) {
  const taxes = lines.map((line) => ({
    lineNumber: line.lineNumber,
    discountAmount: line.discountAmount,
    taxable: line.isItemTaxable,
    tax: line.tax,
    taxableAmount: line.taxableAmount,
    taxCode: line.taxCode,
    details: line.details
  }));
  return taxes;
}
/**
 * @method markCartTax
 * @summary Calls the method accounts/markTaxCalculationFailed through Meteor.
 * @param {Boolean} value - the value to be set
 * @private
 */
function markCartTax(value = true) {
  Meteor.call("accounts/markTaxCalculationFailed", value, (error) => {
    if (error) {
      return Logger.error(error, "Unable to mark the cart");
    }
  });
}


MethodHooks.after("taxes/calculate", (options) => {
  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
  if (cartToCalc.bypassAddressValidation) {
    // User bypassed address validation so we can't calc taxes so don't even try
    return options.result;
  }
  const pkg = taxCalc.getPackageData();

  Logger.debug("Avalara triggered on taxes/calculate for cartId:", cartId);

  if (pkg && pkg.settings.avalara.enabled && pkg.settings.avalara.performTaxCalculation) {
    taxCalc.estimateCart(cartToCalc, (result) => {
      // we don't use totalTax, that just tells us we have a valid tax calculation
      if (result && !result.error && typeof result.totalTax === "number" && result.lines) {
        const taxes = linesToTaxes(result.lines);
        const taxAmount = taxes.reduce((totalTaxes, tax) => totalTaxes + tax.tax, 0);
        const taxRate = taxAmount / taxCalc.calcTaxable(cartToCalc);
        Meteor.call("taxes/setRate", cartId, taxRate, taxes);
        markCartTax(false);
        // for bad auth, timeout, or misconfiguration there's nothing we can do so keep moving
      } else if ([503, 400, 401].includes(result.error.errorCode)) {
        Logger.error("Timeout, Authentification, or Misconfiguration error: Not trying to estimate cart");
        markCartTax(true);
      } else if (result.error.errorCode === 300) {
        Logger.error("Cannot validate address so we cannot calculate tax, skipping");
        markCartTax(true);
      } else {
        Logger.error("Unknown error", result.error.errorCode);
        markCartTax(true);
      }
    });
  }
  return options;
});

MethodHooks.after("cart/copyCartToOrder", (options) => {
  const pkg = taxCalc.getPackageData();
  if (pkg && pkg.settings.avalara.enabled && pkg.settings.avalara.performTaxCalculation) {
    const cartId = options.arguments[0];
    const order = Orders.findOne({ cartId });
    taxCalc.recordOrder(order, (result) => {
      if (result) {
        Logger.info(`Order ${order._id} recorded with Avalara`);
      }
    });
  }
  return options.result;
});

MethodHooks.after("orders/refunds/create", (options) => {
  const pkg = taxCalc.getPackageData();
  if (pkg && pkg.settings.avalara.enabled && pkg.settings.avalara.performTaxCalculation) {
    const orderId = options.arguments[0];
    const order = Orders.findOne(orderId);
    const refundAmount = options.arguments[2];
    taxCalc.reportRefund(order, refundAmount, (result) => {
      if (result) {
        Logger.info(`Refund for order ${order._id} recorded with Avalara`);
      }
    });
  }
  return options;
});
