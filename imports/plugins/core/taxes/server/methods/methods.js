import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Cart, Packages } from "/lib/collections";
import { Taxes } from "../../lib/collections";
import Reaction from "../api";
import { Logger } from "/server/api";

Meteor.methods({
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
    const cartToCalc = Cart.findOne(cartId);
    const shopId = cartToCalc.shopId;
    const pkg = Packages.findOne({
      name: "reaction-taxes",
      shopId: shopId
    });
    // we're going to want to break down the products
    // by qty and an originating shop and inventory
    // for location of each item in the cart.

    if (cartToCalc && pkg) {
      Logger.info("taxes/calculate");

      // for each enabled tax provider
      // pass cartId, get taxes
      // tax method submits cart normalized for service
      // tax method returns normalized response this method
      // update cart with summary tax
      // summary return taxes

      // TODO Determine calculation method (row, total, shipping)

      // TODO package enabled providers
      // Custom Tax Rates are just a full definition of a tax rule.
      // enabling a provider adds a tax rate with additonal provider object.

      // TODO Calculate Taxes!!
    }
  }

  // TODO method for order tax updates
  // additional logic will be needed for refunds
  // or tax adjustments

});
