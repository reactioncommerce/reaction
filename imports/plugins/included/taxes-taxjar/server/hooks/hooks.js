import { Reaction, Logger, MethodHooks } from "/server/api";
import { Packages } from "/lib/collections";

// // Meteor.after to call after
MethodHooks.after("taxes/calculate", (options) => {
  const result = options.result || {};
  const pkg = Packages.findOne({
    name: "taxes-taxjar",
    shopId: Reaction.getShopId(),
    enabled: true
  });

  // check if plugin is enabled and this calculation method is enabled
  if (pkg && pkg && pkg.enabled === true && pkg.settings.taxjar.enabled === true) {
    Logger.warn("TaxJar triggered on taxes/calculate for cartId:", options.arguments[0]);
  }

  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  return result;
});
