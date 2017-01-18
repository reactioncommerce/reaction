import { Meteor } from "meteor/meteor";
import { Logger, MethodHooks } from "/server/api";
import { Cart, Packages } from "/lib/collections";
import taxCalc from "../methods/taxCalc";


function calcTaxable(cart) {
  let subTotal = 0;
  for (const item of cart.items) {
    if (item.variants.taxable) {
      subTotal += (item.variants.price * item.quantity);
    }
  }
  return subTotal;
}

MethodHooks.after("taxes/calculate", function (options) {
  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
  const shopId = cartToCalc.shopId;
  const pkg = Packages.findOne({
    name: "taxes-avalara",
    shopId: shopId,
    enabled: true
  });

  Logger.info("Avalara triggered on taxes/calculate for cartId:", cartId);
  if (pkg && pkg.settings.avalara) {
    taxCalc.estimateCart(cartToCalc, function (result) {
      const taxAmount = parseFloat(result.totalTax);
      const taxRate = taxAmount / calcTaxable(cartToCalc);
      Meteor.call("taxes/setRate", cartId, taxRate);
    });
  }
});
