import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Cart, Packages } from "/lib/collections";
import { Taxes } from "../../lib/collections";
import Reaction from "../api";
import { Logger } from "/server/api";

/**
 * @file Methods for Taxes. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Methods/Taxes
*/

export const methods = {
  /**
   * @name taxes/deleteRate
   * @method
   * @memberof Methods/Taxes
   * @param  {String} taxId tax taxId to delete
   * @return {String} returns update/insert result
   */
  "taxes/deleteRate"(taxId) {
    check(taxId, String);

    // check permissions to delete
    if (!Reaction.hasPermission("taxes")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return Taxes.remove(taxId);
  },

  /**
   * @name taxes/addRate
   * @method
   * @memberof Methods/Taxes
   * @param  {Object} doc A Taxes document to be inserted
   * @param  {String} [docId] DEPRECATED. Existing ID to trigger an update. Use taxes/editRate method instead.
   * @return {String} Insert result
   */
  "taxes/addRate"(doc, docId) {
    check(doc, Object); // actual schema validation happens during insert below

    // Backward compatibility
    check(docId, Match.Optional(String));
    if (docId) return Meteor.call("taxes/editRate", { _id: docId, modifier: doc });

    if (!Reaction.hasPermission("taxes")) throw new Meteor.Error("access-denied", "Access Denied");
    return Taxes.insert(doc);
  },

  /**
   * @name taxes/editRate
   * @method
   * @memberof Methods/Taxes
   * @param  {Object} details An object with _id and modifier props
   * @return {String} Update result
   */
  "taxes/editRate"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens during update below
    });
    if (!Reaction.hasPermission("taxes")) throw new Meteor.Error("access-denied", "Access Denied");
    const { _id, modifier } = details;
    return Taxes.update(_id, modifier);
  },

  /**
   * @name taxes/setRate
   * @summary Update the cart without hooks
   * @method
   * @memberof Methods/Taxes
   * @param  {String} cartId cartId
   * @param  {Number} taxRate taxRate
   * @param  {Object} taxes taxes
   * @return {Number} returns update result
   */
  "taxes/setRate"(cartId, taxRate, taxes) {
    check(cartId, String);
    check(taxRate, Number);
    check(taxes, Match.Optional(Array));

    return Cart.update(cartId, {
      $set: {
        taxes,
        tax: taxRate
      }
    });
  },

  /**
   * @name taxes/setRateByShopAndItem
   * @method
   * @memberof Methods/Taxes
   * @summary Update the cart without hooks
   * @param  {String} cartId cartId
   * @param  {Object} options - Options object
   * @param  {Object} options.taxRatesByShop - Object shopIds: taxRates
   * @param  {Array}  options.itemsWithTax - Items array with computed tax details
   * @param  {Object} options.cartTaxRate - Tax rate for shop associated with cart.shopId
   * @param  {Object} options.cartTaxData - Tax data for shop associated with cart.shopId
   * @return {Number} returns update result
   */
  "taxes/setRateByShopAndItem"(cartId, options) {
    check(cartId, String);
    check(options, {
      taxRatesByShop: Object,
      itemsWithTax: [Object],
      cartTaxRate: Number,
      cartTaxData: Match.OneOf([Object], undefined, null)
    });

    const { cartTaxData, cartTaxRate, itemsWithTax, taxRatesByShop } = options;

    return Cart.update(cartId, {
      $set: {
        taxes: cartTaxData,
        tax: cartTaxRate,
        items: itemsWithTax,
        taxRatesByShop
      }
    });
  },

  /**
   * @name taxes/calculate
   * @method
   * @memberof Methods/Taxes
   * @param  {String} cartId cartId
   * @return {Object}  returns tax object
   */
  "taxes/calculate"(cartId) {
    check(cartId, String);
    const cartToCalc = Cart.findOne(cartId);
    const cartShopId = cartToCalc.shopId;
    let cartTaxRate = 0;

    // TODO: Calculate shipping taxes for regions that require it
    const pkg = Packages.findOne({
      shopId: cartShopId,
      name: "reaction-taxes"
    });
    //
    // custom rates
    // TODO Determine calculation method (row, total, shipping)
    // TODO method for order tax updates
    // additional logic will be needed for refunds
    // or tax adjustments
    //
    // check if plugin is enabled and this calculation method is enabled
    if (pkg && pkg.enabled === true && pkg.settings.rates.enabled === true) {
      Logger.debug("Calculating custom tax rates");

      if (typeof cartToCalc.shipping !== "undefined" && typeof cartToCalc.items !== "undefined") {
        const shippingAddress = cartToCalc.shipping[0].address;
        let totalTax = 0;

        // custom rates that match shipping info
        // high chance this needs more review as
        // it's unlikely this matches all potential
        // here we just sort by postal, so if it's an exact
        // match we're taking the first record, where the most
        // likely tax scenario is a postal code falling
        // back to a regional tax.
        if (shippingAddress) {
          // Get tax rates by shop
          const taxDataByShop = cartToCalc.items.reduce((uniqueShopTaxRates, item) => {
            // lookup custom tax rate for each shop once
            if (!uniqueShopTaxRates[item.shopId]) {
              uniqueShopTaxRates[item.shopId] = Taxes.findOne({
                $and: [{
                  $or: [{
                    postal: shippingAddress.postal
                  }, {
                    postal: { $exists: false },
                    region: shippingAddress.region,
                    country: shippingAddress.country
                  }, {
                    postal: { $exists: false },
                    region: { $exists: false },
                    country: shippingAddress.country
                  }]
                }, {
                  shopId: item.shopId
                }]
              }, { sort: { postal: -1 } });
            }

            return uniqueShopTaxRates;
          }, {});

          const taxRatesByShop = Object.keys(taxDataByShop).reduce((ratesByShop, shopId) => {
            if (taxDataByShop[shopId]) {
              ratesByShop[shopId] = taxDataByShop[shopId].rate / 100;
            }
            return ratesByShop;
          }, {});

          // calculate line item taxes
          const itemsWithTax = cartToCalc.items.map((item) => {
            // init rate to 0
            item.taxRate = 0;
            item.taxData = undefined;
            const shopTaxData = taxDataByShop[item.shopId];

            // only process taxble products and skip if there is no shopTaxData
            if (shopTaxData && item.variants.taxable === true) {
              const shopTaxRate = shopTaxData.rate / 100;

              // If we have tax rates for this shop
              if (shopTaxData && shopTaxRate) {
                item.taxData = shopTaxData;
                item.taxRate = shopTaxRate;
                item.subtotal = item.variants.price * item.quantity;
                item.tax = item.subtotal * item.taxRate;
              }
              totalTax += item.tax;
            }

            // add the item to our new array
            return item;
          });

          if (totalTax > 0) {
            cartTaxRate = totalTax / cartToCalc.getSubTotal();
          }

          // Marketplace Compatible
          Meteor.call("taxes/setRateByShopAndItem", cartToCalc._id, {
            taxRatesByShop,
            itemsWithTax,
            cartTaxRate,
            cartTaxData: undefined
            // not setting cartTaxData here to disguise actual tax rate from client
          });
        } // end custom rates
      } // end shippingAddress calculation
    } else {
      // we are here because the custom rate package is disabled.
      // we're going to set an inital rate of 0
      // all methods that trigger when taxes/calculate will
      // recalculate this rate as needed.
      Meteor.call("taxes/setRate", cartToCalc._id, cartTaxRate);
    }
  } // end taxes/calculate
};

Meteor.methods(methods);
