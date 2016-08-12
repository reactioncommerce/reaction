import { Reaction, Logger, MethodHooks } from "/server/api";
import { Packages } from "/lib/collections";

// // Meteor.after to call after
MethodHooks.after("taxes/calculate", function (options) {
  let result = options.result || {};
  const pkg = Packages.findOne({
    name: "taxes-avalara",
    shopId: Reaction.getShopId()
  });

  // check if plugin is enabled and this calculation method is enabled
  if (pkg.enabled === true  && pkg.settings.avalara.enabled === true) {
    Logger.info("Avalara triggered on taxes/calculate for cartId:", options.arguments[0]);
  }

  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  return result;
});
