import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Logger, MethodHooks } from "/server/api";
import { Shops, Cart, Packages } from "/lib/collections";

//
// this entire method will run after the core/taxes
// plugin runs the taxes/calculate method
// it overrwites any previous tax calculation
// tax methods precendence is determined by
// load order of plugins
//
MethodHooks.after("taxes/calculate", function (options) {
  let result = options.result || {};
  let origin = {};

  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
  const shopId = cartToCalc.shopId;
  const shop = Shops.findOne(shopId);
  const pkg = Packages.findOne({
    name: "taxes-taxcloud",
    shopId: shopId
  });
  // TODO validate package settings exist
  const apiKey = pkg.settings.taxcloud.apiKey;
  const apiLoginId = pkg.settings.taxcloud.apiLoginId;

  // get shop address
  // this will need some refactoring
  // for multi-vendor/shop orders
  if (shop.addressBook) {
    const shopAddress = shop.addressBook[0];
    origin =  {
      Address1: shopAddress.address1,
      City: shopAddress.city,
      State: shopAddress.region,
      Zip5: shopAddress.postal
    };
  }

  // check if plugin is enabled and this calculation method is enabled
  if (pkg && pkg.enabled === true && pkg.settings.taxcloud.enabled === true) {
    if (!apiKey || !apiLoginId) {
      Logger.warn("TaxCloud API Key is required.");
    }
    if (typeof cartToCalc.shipping !== "undefined") {
      const shippingAddress = cartToCalc.shipping[0].address;

      if (shippingAddress) {
        Logger.info("TaxCloud triggered on taxes/calculate for cartId:", cartId);
        const url = "https://api.taxcloud.net/1.0/TaxCloud/Lookup";
        const cartItems = [];
        const destination = {
          Address1: shippingAddress.address1,
          City: shippingAddress.city,
          State: shippingAddress.region,
          Zip5: shippingAddress.postal
        };

        // format cart items to TaxCloud structure
        let index = 0;
        for (let items of cartToCalc.items) {
          // only processs taxable products
          if (items.variants.taxable === true) {
            const item = {
              Index: index,
              ItemID: items.variants._id,
              TIC: "00000",
              Price: items.variants.price,
              Qty: items.quantity
            };
            index ++;
            cartItems.push(item);
          }
        }

        // request object
        const request = {
          headers: {
            "accept": "application/json",
            "content-type": "application/json"
          },
          data: {
            apiKey: apiKey,
            apiLoginId: apiLoginId,
            customerID: cartToCalc.userId,
            cartItems: cartItems,
            origin: origin,
            destination: destination,
            cartID: cartId,
            deliveredBySeller: false
          }
        };

        HTTP.post(url, request, function (error, response) {
          if (!error && response.data.ResponseType === 3) {
            let totalTax = 0;
            for (item of response.data.CartItemsResponse) {
              totalTax += item.TaxAmount;
            }
            // we should consider if we want percentage and dollar
            // as this is assuming that subTotal actually contains everything
            // taxable
            const taxRate = (totalTax / cartToCalc.cartSubTotal());
            Meteor.call("taxes/setRate", cartId, taxRate, response.CartItemsResponse);
          } else {
            Logger.warn("Error fetching tax rate from TaxCloud", response);
          }
        });
      }
    }
  }

  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  return result;
});
