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
  },
  /**
   * taxes/fetchTIC
   * Tax Code fixture data.
   * We're using https://taxcloud.net
   * just to get an intial import data set
   * this service doesn't require taxcloud id
   * but other services need authorization
   * use TAXCODE_SRC  to override source url
   * @param  {String} url alternate url to fetch TaxCodes from
   * @return {undefined}
   */
  "taxes/fetchTIC": function (url) {
    check(url, Match.Optional(String));
    // check(url, Match.Optional(SimpleSchema.RegEx.Url));

    // pretty info
    if (url) {
      Logger.info("Fetching TaxCodes from source: ", url);
    }
    // allow for custom taxCodes from alternate sources
    const TAXCODE_SRC = url || "https://taxcloud.net/tic/?format=json";
    const taxCodes = HTTP.get(TAXCODE_SRC);

    if (taxCodes.data && Reaction.Import.taxCode) {
      for (json of taxCodes.data.tic_list) {
        // transform children and flatten
        // first level of tax children
        // TODO: is there a need to go further
        if (json.tic.children) {
          const children = json.tic.children;
          delete json.tic.children; // remove child levels for now
          // process chilren
          for (json of children) {
            delete json.tic.children; // remove child levels for now
            const taxCode = EJSON.stringify([json.tic]);
            Reaction.Import.process(taxCode, ["id", "label"], Reaction.Import.taxCode);
          }
        }
        // parent code process
        const taxCode = EJSON.stringify([json.tic]);
        Reaction.Import.process(taxCode, ["id", "label"], Reaction.Import.taxCode);
      }
      // commit tax records
      Reaction.Import.flush();
    } else {
      throw new Meteor.error("unable to load taxcodes.");
    }
  }
});
