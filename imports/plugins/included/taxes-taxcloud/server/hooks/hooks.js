import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import MethodHooks from "/imports/plugins/core/core/server/method-hooks";
import { Shops, Cart } from "/lib/collections";

/**
 * @name zipSplit
 * @summary returns ZIP4 and ZIP4 value from a zip code.
 * @method
 * @param  {String} pincode the pincode to be parsed
 * @return {Object} returns { zip4: <ZIP4>, zip5: <ZIP5> }
 */
function zipSplit(pincode) {
  const zipReg = /(?:([\d]{4})-?)?([\d]{5})$/;
  if (!pincode) return { zip4: null, zip5: null };
  const result = pincode.match(zipReg);
  if (!result) return { zip4: null, zip5: null };
  return { zip4: result[1], zip5: result[2] };
}
/**
 * @summary Create mapping of shops -> items
 * @param {Array} items the list of items in cart
 *
 * @returns {Object} shopItemsMap map of shopid: [item1, item2]
 */
function getShopItems(items) {
  // format cart items to TaxCloud structure
  const shopItemsMap = {};
  let index = 0;
  for (const cartItem of items) {
    // only processs taxable products
    if (cartItem.variants && cartItem.variants.taxable === true) {
      const taxCloudItem = {
        Index: index,
        ItemID: cartItem.variants._id,
        TIC: cartItem.variants.taxCode || "00000",
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
  return shopItemsMap;
}
/**
 * @name makeRequest
 * @summary make the requests object
 * @param {String} shopId the shopId of the product
 * @param {Object} cartToCalc current cart
 * @param {Object} shippingAddressMap map of shop: address
 * @param {Object} shopItemsMap map of shop: items
 * @param {Object} shopsAddressMap map of shop: address
 *
 * @returns {Promise} promise of a request
 */
function makeRequest(shopId, cartToCalc, shippingAddressMap, shopItemsMap, shopsAddressMap) {
  const taxCloudSettings = Reaction.getPackageSettingsWithOptions({ name: "taxes-taxcloud", shopId });
  const { apiKey, apiLoginId } = taxCloudSettings.settings.taxcloud;
  if (!apiKey || !apiLoginId) {
    Logger.warn("TaxCloud API Key is required.");
    return Promise.reject("TaxCloud API Key not present");
  }
  const url = "https://api.taxcloud.net/1.0/TaxCloud/Lookup";
  const shopAddress = shopsAddressMap[shopId];
  if (!shopAddress) {
    return Promise.reject();
  }
  const { zip4: originZip4, zip5: originZip5 } = zipSplit(shopAddress.postal);
  const origin = {
    Address1: shopAddress.address1,
    Address2: shopAddress.address2,
    City: shopAddress.city,
    State: shopAddress.region,
    Zip5: originZip5,
    Zip4: originZip4
  };

  const shippingAddress = shippingAddressMap[shopId];
  if (!shippingAddress) {
    return Promise.reject();
  }
  const { zip4: destZip4, zip5: destZip5 } = zipSplit(shippingAddress.postal);
  const destination = {
    Address1: shippingAddress.address1,
    Address2: shippingAddress.address2,
    City: shippingAddress.city,
    State: shippingAddress.region,
    Zip5: destZip5,
    Zip4: destZip4
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

  return new Promise((resolve, reject) => {
    HTTP.post(url, request, (error, response) => {
      if (error) {
        reject(error);
        throw new Error("Error from taxcloud API", error);
      }
      // ResponseType 3 is a successful call.
      if (response.data.ResponseType !== 3) {
        let errMsg = "Unable to access service. Check credentials.";
        if (response && response.data.Messages[0].Message) {
          errMsg = response.data.Messages[0].Message;
        }
        reject(errMsg);
        throw new Error("Error from taxcloud API", errMsg);
      }
      resolve({
        items: response.data.CartItemsResponse,
        shopId
      });
    });
  });
}

/**
 * @name mapTaxes
 * @summary maps the item to tax details
 * @param {Object} cartToCalc the cart object
 * @param {Array} line individual item's response from TaxCloud's API
 * @returns {Object} object containing details of tax.
 */
function mapTaxes(cartToCalc, line) {
  const cartPosition = line.CartItemIndex;
  const item = cartToCalc.items[cartPosition];
  return {
    lineNumber: item._id,
    taxable: item.variants.taxable,
    tax: line.TaxAmount,
    taxableAmount: item.quantity * item.variants.price,
    taxCode: item.variants.taxCode
  };
}

/**
 * @name processResponse
 * @summary gets the tax from the responses and updated the cart
 * @param {Array} responsePromise array of promises for tax-cloud requests
 * @param {Object} cartToCalc the cart object
 * @returns {Promise} promise of all actions on the responses
 */
function processResponse(responsePromise, cartToCalc) {
  if (!responsePromise || responsePromise.length === 0) {
    // No items in the cart.
    Meteor.call("taxes/setRate", cartToCalc._id, 0);
    Meteor.call("accounts/markTaxCalculationFailed", false);
    return Promise.resolve();
  }
  let totalTax = 0;
  const subtotalsByShop = cartToCalc.getSubtotalByShop();
  const subTotal = cartToCalc.getSubTotal();
  return Promise.all(responsePromise)
    .then((result) => {
      const cartTaxData = [];
      const taxRatesByShop = {};
      let shopId = null;
      result.forEach((res) => {
        let shopTax = 0;
        for (const item of res.items) {
          totalTax += item.TaxAmount;
          shopTax += item.TaxAmount;
          const cartPosition = item.CartItemIndex;
          const product = cartToCalc.items[cartPosition];
          product.taxRate = item.TaxAmount / (product.quantity * product.variants.price);
          ({ shopId } = product);
          cartTaxData.push(mapTaxes(cartToCalc, item));
        }
        taxRatesByShop[shopId] = shopTax / subtotalsByShop[shopId];
      });
      // we should consider if we want percentage and dollar
      // as this is assuming that subTotal actually contains everything
      // taxable
      console.log("Settings tax as ", {
        taxRatesByShop,
        itemsWithTax: cartToCalc.items,
        cartTaxRate: totalTax / subTotal,
        cartTaxData
      })
      Meteor.call("taxes/setRateByShopAndItem", cartToCalc._id, {
        taxRatesByShop,
        itemsWithTax: cartToCalc.items,
        cartTaxRate: totalTax / subTotal,
        cartTaxData
      });
      return Meteor.call("accounts/markTaxCalculationFailed", false);
    })
    .catch((error) => {
    // No rates were fetched, set taxes to 0.
      resetTaxes(cartToCalc);
      Meteor.call("accounts/markTaxCalculationFailed", true);
      Logger.error("Error fetching tax rate from TaxCloud:", error);
    });
}

/**
 * @name getShopsAddressMap
 * @summary return the mapping of shop: address
 *          returns null if any shops doesn't has a address
 * @param {object} shopItemsMap maps of shopsId: [items]
 * @returns {object} map of shop:address
 */
function getShopsAddressMap(shopItemsMap) {
  // Create a map of shopId -> shopAddress
  const shopsList = Shops.find({ _id: { $in: Object.keys(shopItemsMap) } }, { _id: 1, addressBook: 1 }).fetch();
  const shopsAddressMap = shopsList.reduce((addressMap, shop) => {
    if (!shop || !shop.addressBook) {
      return null;
    }
    [addressMap[shop._id]] = shop.addressBook;
    return addressMap;
  }, {});
  return shopsAddressMap;
}

/**
 * @name shippingAddressMap
 * @summary return the mapping of shop: shipping-address
 *          returns null if any user hasn't entered a address
 * @param {object} cartToCalc current cart
 * @param {number} numberOfShops number of unique shops in the cart.
 * @returns {object} map of shop: shipping-address
 */
function getShippingAddressMap(cartToCalc) {
  if (!cartToCalc.shipping) {
    return null;
  }
  const shippingAddressMap = cartToCalc.shipping.reduce((addressMap, shipping) => {
    if (!addressMap || !shipping.address) {
      return null;
    }
    if (!addressMap[shipping.shopId]) {
      addressMap[shipping.shopId] = shipping.address;
    }
    return addressMap;
  }, {});
  return shippingAddressMap;
}

/**
 * @name calculateTax
 * @summary gets tax from the API and updates the cart.
 * @param  {Object} cartToCalc cart object from the database.
 * @returns {undefined}
 */
function calculateTax(cartToCalc) {
  Logger.debug("TaxCloud triggered on taxes/calculate for cartId:", cartToCalc._id);
  const { items } = cartToCalc;
  const shopItemsMap = getShopItems(items);
  const numberOfShops = Object.keys(shopItemsMap).length;
  const shippingAddressMap = getShippingAddressMap(cartToCalc, numberOfShops);
  const shopsAddressMap = getShopsAddressMap(shopItemsMap);
  if (!shippingAddressMap || Object.keys(shippingAddressMap).length !== Object.keys(shopItemsMap).length) {
    // User hasn't entered address yet
    resetTaxes(cartToCalc);
    return;
  }
  if (!shopsAddressMap) {
    // All the marketplace shops don't have address yet.
    resetTaxes(cartToCalc);
    Logger.error("All the marketplace shops don't have an address yet.");
    return;
  }
  // For each shop get the tax on the products.
  const responsePromise = Object.keys(shopItemsMap).map((shopId) => makeRequest(shopId, cartToCalc, shippingAddressMap, shopItemsMap, shopsAddressMap));
  processResponse(responsePromise, cartToCalc);
}

/**
 * @method resetTaxes
 * @summary sets the tax = 0 and nullifies all tax related fields.
 * @param {Object} cartToCalc the cart to calculate tax for
 * @returns {undefined}
 */
function resetTaxes(cartToCalc) {
  let items = [];
  if (cartToCalc.items) {
    items = cartToCalc.items.map((item) => {
      item.taxRate = 0;
    });
  }
  Meteor.call("taxes/setRateByShopAndItem", cartToCalc._id, {
    taxRatesByShop: null,
    itemsWithTax: items,
    cartTaxRate: 0,
    cartTaxData: null
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
        calculateTax(cartToCalc);
      } else {
        resetTaxes(cartToCalc);
      }
    }
  }
  // Default return value is the return value of previous call in method chain
  // or an empty object if there's no result yet.
  return result;
});
