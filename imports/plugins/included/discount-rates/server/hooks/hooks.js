import { Reaction, Logger, MethodHooks } from "/server/api";
import { Packages } from "/lib/collections";

MethodHooks.after("discounts/calculate", function (options) {
  const result = options.result || {};
  const pkg = Packages.findOne({
    name: "discount-rates",
    shopId: Reaction.getShopId(),
    enabled: true
  });

  // check if plugin is enabled and this calculation method is enabled
  if (pkg && pkg.settings["discount-rates"].enabled === true) {
    Logger.info("Discount rates triggered on cartId:", options.arguments[0]);
  }

  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  return result;
});
