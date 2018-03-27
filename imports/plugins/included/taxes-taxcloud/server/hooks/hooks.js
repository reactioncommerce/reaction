import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Logger, MethodHooks, Reaction } from "/server/api";
import { Shops, Cart } from "/lib/collections";

//
// this entire method will run after the core/taxes
// plugin runs the taxes/calculate method
// it overrwites any previous tax calculation
// tax methods precendence is determined by
// load order of plugins
//
MethodHooks.after("taxes/calculate", (options) => {
  const result = options.result || {};
  let origin = {};

  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
  if (cartToCalc) {
    const { shopId } = cartToCalc;
    const shop = Shops.findOne(shopId);
    const pkgSettings = Reaction.getPackageSettings("taxes-taxcloud");

    if (pkgSettings && pkgSettings.settings.taxcloud.enabled === true) {
      const { apiKey, apiLoginId } = pkgSettings.settings.taxcloud;

      // get shop address
      // this will need some refactoring
      // for multi-vendor/shop orders
      if (shop.addressBook) {
        const shopAddress = shop.addressBook[0];
        origin = {
          Address1: shopAddress.address1,
          City: shopAddress.city,
          State: shopAddress.region,
          Zip5: shopAddress.postal
        };
      }

      if (!apiKey || !apiLoginId) {
        Logger.warn("TaxCloud API Key is required.");
      }
      if (Array.isArray(cartToCalc.shipping) && cartToCalc.shipping.length > 0 && cartToCalc.items) {
        const shippingAddress = cartToCalc.shipping[0].address;

        if (shippingAddress) {
          Logger.debug("TaxCloud triggered on taxes/calculate for cartId:", cartId);
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
          for (const items of cartToCalc.items) {
            // only processs taxable products
            if (items.variants.taxable === true) {
              const item = {
                Index: index,
                ItemID: items.variants._id,
                TIC: "00000",
                Price: items.variants.price,
                Qty: items.quantity
              };
              index += 1;
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
              apiKey,
              apiLoginId,
              customerID: cartToCalc.userId,
              cartItems,
              origin,
              destination,
              cartID: cartId,
              deliveredBySeller: false
            }
          };

          try {
            const response = HTTP.post(url, request);
            let taxRate = 0;
            // ResponseType 3 is a successful call.
            if (response.data.ResponseType !== 3) {
              let errMsg = "Unable to access service. Check credentials.";
              if (response && response.data.Messages[0].Message) {
                errMsg = response.data.Messages[0].Message;
              }
              throw new Error("Error calling taxcloud API", errMsg);
            }

            let totalTax = 0;
            for (const item of response.data.CartItemsResponse) {
              totalTax += item.TaxAmount;
            }
            // don't run this calculation if there isn't tax.
            if (totalTax > 0) {
              taxRate = (totalTax / cartToCalc.getSubTotal());
            }
            // we should consider if we want percentage and dollar
            // as this is assuming that subTotal actually contains everything
            // taxable
            const taxes = []; // only populated for Avalara
            Meteor.call("taxes/setRate", cartId, taxRate, taxes);
          } catch (error) {
            Logger.warn("Error fetching tax rate from TaxCloud:", error.message);
          }
        }
      }
    }
  }
  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  return result;
});
