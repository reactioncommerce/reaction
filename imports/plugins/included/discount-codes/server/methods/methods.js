import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";
import { DiscountCodes as DiscountSchema } from "../../lib/collections/schemas";

/**
 * @namespace Discounts/Codes/Methods
 */

// attach discount code specific schema
Discounts.attachSchema(DiscountSchema, { selector: { discountMethod: "code" } });

export const methods = {
  /**
   * @name discounts/addCode
   * @method
   * @memberof Discounts/Codes/Methods
   * @param  {Object} doc A Discounts document to be inserted
   * @returns {String} Insert result
   */
  "discounts/addCode"(doc) {
    check(doc, Object); // actual schema validation happens during insert below

    const shopId = Reaction.getShopId();

    if (!Reaction.hasPermission("discounts", Reaction.getUserId(), shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    doc.shopId = shopId;
    return Discounts.insert(doc);
  },

  /**
   * @name discounts/editCode
   * @method
   * @memberof Discounts/Codes/Methods
   * @param  {Object} details An object with _id and modifier props
   * @returns {String} Update result
   */
  "discounts/editCode"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens during update below
    });

    const shopId = Reaction.getShopId();

    if (!Reaction.hasPermission("discounts", Reaction.getUserId(), shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    const { _id, modifier } = details;
    return Discounts.update({ _id, shopId }, modifier);
  },

  /**
   * @name discounts/deleteCode
   * @method
   * @memberof Discounts/Codes/Methods
   * @param  {String} discountId discount id to delete
   * @returns {String} returns remove result
   */
  "discounts/deleteCode"(discountId) {
    check(discountId, String);

    const shopId = Reaction.getShopId();

    if (!Reaction.hasPermission("discounts", Reaction.getUserId(), shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    return Discounts.remove({
      _id: discountId,
      shopId
    });
  }
};

// export methods to Meteor
Meteor.methods(methods);
