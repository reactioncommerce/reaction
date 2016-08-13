import { Meteor } from "meteor/meteor";
import { Logger, MethodHooks } from "/server/api";
import { Cart, Packages } from "/lib/collections";
import Avalara from "avalara-taxrates";

//
// this entire method will run after the core/taxes
// plugin runs the taxes/calculate method
// it overrwites any previous tax calculation
// tax methods precendence is determined by
// load order of plugins
//
// also note that we should address the issue
// of the alpha-3 requirement for avalara,
// and also weither we need the npm package or
// should we just use HTTP.
//
MethodHooks.after("taxes/calculate", function (options) {
  let result = options.result || {};
  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
  const shopId = cartToCalc.shopId;

  const pkg = Packages.findOne({
    name: "taxes-avalara",
    shopId: shopId
  });

  // TODO validate package settings exist
  const apiKey = pkg.settings.avalara.apiLoginId;

  // process rate callback object
  const processTaxes = Meteor.bindEnvironment(function processTaxes(res) {
    if (!res.error) {
      Meteor.call("taxes/setRate", cartId, (res.totalRate / 100), res.rates);
    } else {
      Logger.warn("Error fetching tax rate from Avalara", res.code, res.message);
    }
  });

  // check if plugin is enabled and this calculation method is enabled
  if (pkg && pkg.enabled === true && pkg.settings.avalara.enabled === true) {
    if (!apiKey) {
      Logger.warn("Avalara API Key is required.");
    }
    if (typeof cartToCalc.shipping !== "undefined") {
      const shippingAddress = cartToCalc.shipping[0].address;

      // TODO evaluate country-data
      // either replace our current countries data source
      // or integrate the alpha-3 codes into our dataset.
      // const countries = require("country-data").countries;
      const lookup = require("country-data").lookup;
      // converting iso alpha 2 country to ISO 3166-1 alpha-3
      const country = lookup.countries({alpha2: shippingAddress.country})[0];

      if (shippingAddress) {
        Logger.info("Avalara triggered on taxes/calculate for cartId:", cartId);
        // get tax rate by street address
        Avalara.taxByAddress(apiKey,
          shippingAddress.address1,
          shippingAddress.city,
          shippingAddress.region,
          country.alpha3,
          shippingAddress.postal,
          processTaxes);
      }
    }
  }

  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  return result;
});
