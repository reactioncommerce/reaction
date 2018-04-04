import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Logger, MethodHooks, Reaction } from "/server/api";
import { Shops, Cart } from "/lib/collections";

function zipSplit(pincode) {
  const zipReg = /(?:([\d]{4})-?)?([\d]{5})$/;
  if (!pincode) return { zip4: null, zip5: null };
  const result = pincode.match(zipReg);
  if (!result) return { zip4: null, zip5: null };
  return { zip4: result[1], zip5: result[2] };
}

function calculateTax(pkgSettings, cartToCalc) {
  Logger.debug("TaxCloud triggered on taxes/calculate for cartId:", cartToCalc._id);
  const url = "https://api.taxcloud.net/1.0/TaxCloud/Lookup";
  const shopItemsMap = {};
  const shippingAddress = cartToCalc.shipping[0].address;
  // User hasn't entered shipping address yet.
  if (!shippingAddress) return;
  const destination = {
    Address1: shippingAddress.address1,
    City: shippingAddress.city,
    State: shippingAddress.region,
    Zip5: shippingAddress.postal
  };

  // format cart items to TaxCloud structure
  let index = 0;
  const { items } = cartToCalc;
  // Create mapping of shops -> items
  for (const cartItem of items) {
    // only processs taxable products
    if (cartItem.variants.taxable === true) {
      const taxCloudItem = {
        Index: index,
        ItemID: cartItem.variants._id,
        TIC: "00000",
        Price: cartItem.variants.price,
        Qty: cartItem.quantity
      };
      index += 1;
      if (!shopItemsMap[cartItem.shopId]) {
        shopItemsMap[cartItem.shopId] = [];
      }
      shopItemsMap[cartItem.shopId].push(taxCloudItem);
    }
  }
  // Create a map of shopId -> shopAddress
  const shopsList = Shops.find({ _id: { $in: Object.keys(shopItemsMap) } }, { _id: 1, addressBook: 1 }).fetch();
  let shopsHaveAddress = true;
  const shopsAddressMap = shopsList.reduce((addressMap, shop) => {
    if (!shop.addressBook) {
      shopsHaveAddress = false;
      return;
    }
    [addressMap[shop._id]] = shop.addressBook;
    return addressMap;
  }, {});
  if (!shopsHaveAddress) {
    // All the marketplace shops don't have address yet.
    Logger.error("All the marketplace shops don't have address yet.");
    return;
  }
  let totalTax = 0;
  const subtotalsByShop = cartToCalc.getSubtotalByShop();
  const subTotal = cartToCalc.getSubTotal();
  // For each shop get the tax on the products.
  Object.keys(shopItemsMap).forEach((shopId) => {
    const taxCloudSettings = Reaction.getPackageSettingsWithOptions({ name: "taxes-taxcloud", shopId });
    const { apiKey, apiLoginId } = taxCloudSettings.settings.taxcloud;
    if (!apiKey || !apiLoginId) {
      Logger.warn("TaxCloud API Key is required.");
    }
    const shopAddress = shopsAddressMap[shopId];
    const { zip4: Zip4, zip5: Zip5 } = zipSplit(shopAddress.postal);
    const origin = {
      Address1: shopAddress.address1,
      City: shopAddress.city,
      State: shopAddress.region,
      Zip5,
      Zip4
    };
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
        cartItems: shopItemsMap[shopId],
        origin,
        destination,
        cartID: cartToCalc._id,
        deliveredBySeller: false
      }
    };

    try {
      const response = HTTP.post(url, request);
      // ResponseType 3 is a successful call.
      if (response.data.ResponseType !== 3) {
        let errMsg = "Unable to access service. Check credentials.";
        if (response && response.data.Messages[0].Message) {
          errMsg = response.data.Messages[0].Message;
        }
        throw new Error("Error calling taxcloud API", errMsg);
      }
      for (const item of response.data.CartItemsResponse) {
        totalTax += item.TaxAmount;
        const cartPosition = item.CartItemIndex;
        items[cartPosition].taxRate =
        item.TaxAmount / subtotalsByShop[shopId];
      }
    } catch (error) {
      Logger.warn("Error fetching tax rate from TaxCloud:", error.message);
    }
  });

  // const taxRate = (totalTax / cartToCalc.getSubTotal());
  // we should consider if we want percentage and dollar
  // as this is assuming that subTotal actually contains everything
  // taxable
  Meteor.call("taxes/setRateByShopAndItem", cartToCalc._id, {
    taxRatesByShop: undefined,
    itemsWithTax: items,
    cartTaxRate: totalTax / subTotal,
    cartTaxData: undefined
  });
}
//
// this entire method will run after the core/taxes
// plugin runs the taxes/calculate method
// it overrwites any previous tax calculation
// tax methods precendence is determined by
// load order of plugins
//
MethodHooks.after("taxes/calculate", (options) => {
  const result = options.result || {};
  const cartId = options.arguments[0];
  const cartToCalc = Cart.findOne(cartId);
  if (cartToCalc) {
    const pkgSettings = Reaction.getPackageSettings("taxes-taxcloud");
    if (pkgSettings && pkgSettings.settings.taxcloud.enabled === true) {
      if (Array.isArray(cartToCalc.shipping) && cartToCalc.shipping.length > 0 && cartToCalc.items) {
        calculateTax(pkgSettings, cartToCalc);
      }
    }
  }
  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  return result;
});
