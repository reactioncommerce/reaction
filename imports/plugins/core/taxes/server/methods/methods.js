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
   * @param  {String} docId    tax docId
   * @return {String} returns update/insert result
   */

  "taxes/deleteRate": function (docId) {
    check(docId, String);

    // check permissions to delete
    if (!Reaction.hasPermission("taxes")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Taxes.delete(docId);
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
   * @return {Object  returns tax object
   */

  "taxes/calculate": function (cartId) {
    check(cartId, String);
    let results = {};
    const cartToCalc = Cart.findOne(cartId);
    const shopId = cartToCalc.shopId;
    // const pkg = Packages.findOne({
    //   name: "reaction-taxes",
    //   shopId: shopId
    // });
    if (cartToCalc.shipping) {
      const shippingAddress = cartToCalc.shipping[0].address;
      //
      // custom rates that match shipping info
      // high chance this needs more review as
      // it's unlikely this matches all potential
      //
      if (shippingAddress) {
        let addressTaxData = Taxes.find(
          {
            $and: [{
              $or: [{
                postal: shippingAddress.postal
              }, {
                postal: shippingAddress.postal,
                city: shippingAddress.city,
                region: shippingAddress.region
              }]
            }, {
              shopId: shopId
            }, {
              country: shippingAddress.country
            }]
          }
        ).fetch();
        // return custom rates
        if (addressTaxData.length > 0) {
          // we're going to want to break down the products
          // by qty and an originating shop and inventory
          // for location of each item in the cart.
          const tax = parseFloat(addressTaxData[0].rate) / 100.0;
          // this is temporary handling
          return Cart.update(cartToCalc._id, {
            $set: {
              taxes: addressTaxData,
              tax: tax
            }
          });
        }
      } // end shippingAddress calculation
    }

    // if (cartToCalc && pkg) {
    //   Logger.info("taxes/calculate");
    //
    //   // for each enabled tax provider
    //   // pass cartId, get taxes
    //   // tax method submits cart normalized for service
    //   // tax method returns normalized response this method
    //   // update cart with summary tax
    //   // summary return taxes
    //
    //   // TODO Determine calculation method (row, total, shipping)
    //
    //   // TODO package enabled providers
    //   // Custom Tax Rates are just a full definition of a tax rule.
    //   // enabling a provider adds a tax rate with additonal provider object.
    //
    //   // TODO Calculate Taxes!!
    // }

    // TODO method for order tax updates
    // additional logic will be needed for refunds
    // or tax adjustments
    return results;
  } // end taxes/calculate
};

// export tax methods to Meteor
Meteor.methods(methods);
