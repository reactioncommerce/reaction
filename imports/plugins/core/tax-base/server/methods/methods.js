import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { HTTP } from "meteor/http";
import { EJSON } from "meteor/ejson";
// import { SimpleSchema } from "meteor/aldeed:simple-schema";
// import { Shops, Cart } from "/lib/collections";
// import { Taxes, TaxCodes } from "../../lib/collections";
import { Taxes } from "../../lib/collections";
import { Logger } from "/server/api";
import Reaction from "../api";

Meteor.methods({
  /**
   * taxes/addRate
   * @param  {String} modifier update statement
   * @param  {String} docId    tax docId
   * @return {String} returns update/insert result
   */

  "taxes/addRate": function (modifier, docId) {
    check(modifier, Object);
    check(docId, Match.OneOf(Object, null, undefined));
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
    const cart = Cart.findOne(cartId);
    // we're going to want to break down the products
    // by qty and an originating shop and inventory
    // for location of each item in the cart.

    // TODO Calculate Taxes!!
  }
});
