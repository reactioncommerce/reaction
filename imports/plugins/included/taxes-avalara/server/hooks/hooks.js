import { Meteor } from "meteor/meteor";
import { Logger, MethodHooks } from "/server/api";
import { Cart, Orders } from "/lib/collections";
import taxCalc from "../methods/taxCalc";

MethodHooks.after("taxes/calculate", function (options) {
  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
  const pkg = taxCalc.getPackageData();

  Logger.debug("Avalara triggered on taxes/calculate for cartId:", cartId);
  if (pkg && pkg.settings.avalara.enabled) {
    taxCalc.estimateCart(cartToCalc, function (result) {
      if (result) {
        const taxAmount = parseFloat(result.totalTax);
        const taxRate = taxAmount / taxCalc.calcTaxable(cartToCalc);
        Meteor.call("taxes/setRate", cartId, taxRate);
      }
    });
  }
});

MethodHooks.after("cart/copyCartToOrder", function (options) {
  const pkg = taxCalc.getPackageData();
  if (pkg && pkg.settings.avalara.enabled) {
    const cartId = options.arguments[0];
    const order = Orders.findOne({ cartId: cartId });
    taxCalc.recordOrder(order, function (result) {
      if (result) {
        Logger.info(`Order ${order._id} recorded with Avalara`);
      }
    });
    return options;
  }
});

MethodHooks.after("orders/refunds/create", (options) => {
  const pkg = taxCalc.getPackageData();
  if (pkg && pkg.settings.avalara.enabled) {
    const orderId = options.arguments[0];
    const order = Orders.findOne(orderId);
    const refundAmount = options.arguments[2];
    taxCalc.reportRefund(order, refundAmount, function (result) {
      if (result) {
        Logger.info(`Refund for order ${order._id} recorded with Avalara`);
      }
    });
  }
});
