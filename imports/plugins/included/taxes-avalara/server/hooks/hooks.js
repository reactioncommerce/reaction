import { Meteor } from "meteor/meteor";
import { Logger, MethodHooks } from "/server/api";
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


MethodHooks.after("taxes/calculate", (options) => {
  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
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
        // for bad auth, timeout, or misconfiguration there's nothing we can do so keep moving
      } else if ([503, 400, 401].includes(result.error.errorCode)) {
        Logger.error("Timeout, Authentification, or Misconfiguration error: Not trying to estimate cart");
      } else {
        Logger.error("Unknown error", result.error.errorCode);
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
