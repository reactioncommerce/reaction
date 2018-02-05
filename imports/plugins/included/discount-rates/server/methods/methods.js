import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Reaction } from "/server/api";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";
import { DiscountRates as DiscountSchema } from "../../lib/collections/schemas";

// attach discount code specific schema
Discounts.attachSchema(DiscountSchema, { selector: { discountMethod: "rate" } });

//
// make all discount methods available
//
export const methods = {
  /**
   * discounts/rates/amount
   * for discount rates
   * @param  {String} cartId cartId
   * @param  {String} rateId rateid
   * @return {Number} returns discount total
   */
  "discounts/rates/amount"(cartId, rateId) {
    check(cartId, String);
    check(rateId, String);
    const rate = 0;
    // TODO: discounts/rates/amount
    // should be pricing rate lookup.
    return rate;
  },

  "discounts/rates/discount"(cartId, rateId) {
    check(cartId, String);
    check(rateId, String);
    const rate = 0;
    // TODO: discounts/rates/discount
    return rate;
  },

  /**
   * @name discounts/addRate
   * @method
   * @param  {Object} doc A Discounts document to be inserted
   * @param  {String} [docId] DEPRECATED. Existing ID to trigger an update. Use discounts/editCode method instead.
   * @return {String} Insert result
   */
  "discounts/addRate"(doc, docId) {
    check(doc, Object); // actual schema validation happens during insert below

    // Backward compatibility
    check(docId, Match.Optional(String));
    if (docId) return Meteor.call("discounts/editRate", { _id: docId, modifier: doc });

    if (!Reaction.hasPermission("discount-rates")) throw new Meteor.Error("access-denied", "Access Denied");
    return Discounts.insert(doc);
  },

  /**
   * @name discounts/editRate
   * @method
   * @param  {Object} details An object with _id and modifier props
   * @return {String} Update result
   */
  "discounts/editRate"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens during update below
    });
    if (!Reaction.hasPermission("discount-rates")) throw new Meteor.Error("access-denied", "Access Denied");
    const { _id, modifier } = details;
    return Discounts.update(_id, modifier);
  }
};

// export methods to Meteor
Meteor.methods(methods);
