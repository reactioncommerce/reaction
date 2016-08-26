import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Cart, Packages } from "/lib/collections";
import { Taxes } from "../../lib/collections";
import Reaction from "../api";
import { Logger } from "/server/api";

//
// make all tax methods available
//
export const methods = {
  /**
   * taxes/deleteRate
   * @param  {String} taxId tax taxId to delete
   * @return {String} returns update/insert result
   */
  "taxes/deleteRate": function (taxId) {
    check(taxId, String);

    // check permissions to delete
    if (!Reaction.hasPermission("taxes")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Taxes.remove(taxId);
  },

  /**
   * taxes/setRate
   * @param  {String} cartId cartId
   * @param  {Number} taxRate taxRate
   * @param  {Object} taxes taxes
   * @return {Number} returns update result
   */
  "taxes/setRate": function (cartId, taxRate, taxes) {
    check(cartId, String);
    check(taxRate, Number);
    check(taxes, Match.Optional(Array));

    return Cart.update(cartId, {
      $set: {
        taxes: taxes,
        tax: taxRate
      }
    });
  },

  /**
   * taxes/addRate
   * @param  {String} modifier update statement
   * @param  {String} docId    tax docId
   * @return {String} returns update/insert result
   */
  "taxes/addRate": function (modifier, docId) {
    check(modifier, Object);
    check(docId, Match.OneOf(String, null, undefined));

    // check permissions to add
    if (!Reaction.hasPermission("taxes")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // if no doc, insert
    if (!docId) {
      return Taxes.insert(modifier);
    }
    // else update and return
    return Taxes.update(docId, modifier);
  },

  /**
   * taxes/calculate
   * @param  {String} cartId cartId
   * @return {Object}  returns tax object
   */
  "taxes/calculate": function (cartId) {
    check(cartId, String);
    const cartToCalc = Cart.findOne(cartId);
    const shopId = cartToCalc.shopId;
    let taxRate = 0;
    // get all tax packages
    //
    // TODO FIND IN LAYOUT/REGISTRY
    //
    const pkg = Packages.findOne({
      shopId: shopId,
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
      Logger.info("Calculating custom tax rates");

      if (typeof cartToCalc.shipping !== "undefined") {
        const shippingAddress = cartToCalc.shipping[0].address;
        //
        // custom rates that match shipping info
        // high chance this needs more review as
        // it's unlikely this matches all potential
        // here we just sort by postal, so if it's an exact
        // match we're taking the first record, where the most
        // likely tax scenario is a postal code falling
        // back to a regional tax.

        if (shippingAddress) {
          let customTaxRate = 0;
          let totalTax = 0;
          // lookup custom tax rate
          const addressTaxData = Taxes.find(
            {
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
                shopId: shopId
              }]
            }, {sort: { postal: -1 } }
          ).fetch();

          // return custom rates
          // TODO  break down the product origination, taxability
          // by qty and an originating shop and inventory
          // for location of each item in the cart.
          if (addressTaxData.length > 0) {
            customTaxRate = addressTaxData[0].rate;
          }

          // calculate line item taxes
          for (const items of cartToCalc.items) {
            // only processs taxable products
            if (items.variants.taxable === true) {
              const subTotal = items.variants.price * items.quantity;
              const tax = subTotal * (customTaxRate / 100);
              totalTax += tax;
            }
          }
          // calculate overall cart rate
          if (totalTax > 0) {
            taxRate = (totalTax / cartToCalc.cartSubTotal());
          }
          // store tax on cart
          Meteor.call("taxes/setRate", cartToCalc._id, taxRate, addressTaxData);
        } // end custom rates
      } // end shippingAddress calculation
    } else {
      // we are here because the custom rate package is disabled.
      // we're going to set an inital rate of 0
      // all methods that trigger when taxes/calculate will
      // recalculate this rate as needed.
      Meteor.call("taxes/setRate", cartToCalc._id, taxRate);
    }
  } // end taxes/calculate
};

// export tax methods to Meteor
Meteor.methods(methods);
