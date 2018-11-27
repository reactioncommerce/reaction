import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import appEvents from "/imports/node-app/core/util/appEvents";
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
   * @param  {String} [docId] DEPRECATED. Existing ID to trigger an update. Use discounts/editCode method instead.
   * @return {String} Insert result
   */
  "discounts/addCode"(doc, docId) {
    check(doc, Object); // actual schema validation happens during insert below

    // Backward compatibility
    check(docId, Match.Optional(String));
    if (docId) return Meteor.call("discounts/editCode", { _id: docId, modifier: doc });

    if (!Reaction.hasPermission("discount-codes")) throw new ReactionError("access-denied", "Access Denied");
    doc.shopId = Reaction.getShopId();
    return Discounts.insert(doc);
  },

  /**
   * @name discounts/editCode
   * @method
   * @memberof Discounts/Codes/Methods
   * @param  {Object} details An object with _id and modifier props
   * @return {String} Update result
   */
  "discounts/editCode"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens during update below
    });
    if (!Reaction.hasPermission("discount-codes")) throw new ReactionError("access-denied", "Access Denied");
    const { _id, modifier } = details;
    return Discounts.update(_id, modifier);
  },

  /**
   * @name discounts/codes/remove
   * @method
   * @memberof Discounts/Codes/Methods
   * @summary removes discounts that have been previously applied to a cart.
   * @param  {String} id cart id of which to remove a code
   * @param  {String} codeId discount Id from cart.billing
   * @param  {String} collection collection (either Orders or Cart)
   * @return {String} returns update/insert result
   */
  "discounts/codes/remove"(id, codeId, collection = "Cart") {
    check(id, String);
    check(codeId, String);
    check(collection, String);
    const Collection = Reaction.Collections[collection];

    // TODO: update a history record of transaction
    // The Payment schema currency defaultValue is adding {} to the $pull condition.
    // If this issue is eventually fixed, autoValues can be re-enabled here
    // See https://github.com/aldeed/simple-schema-js/issues/272
    const result = Collection.update(
      { _id: id },
      { $pull: { billing: { _id: codeId } } },
      { getAutoValues: false }
    );

    if (collection === "Cart") {
      const updatedCart = Collection.findOne({ _id: id });
      Promise.await(appEvents.emit("afterCartUpdate", updatedCart));
    }

    return result;
  },

  /**
   * @name discounts/codes/apply
   * @method
   * @memberof Discounts/Codes/Methods
   * @summary checks validity of code conditions and then applies a discount as a paymentMethod to cart
   * @param  {String} id cart/order id of which to remove a code
   * @param  {String} code valid discount code
   * @param  {String} collection collection (either Orders or Cart)
   * @return {Boolean} returns true if successfully applied
   */
  "discounts/codes/apply"(id, code, collection = "Cart") {
    check(id, String);
    check(code, String);
    check(collection, String);
    let userCount = 0;
    let orderCount = 0;

    // check to ensure discounts can only apply to single shop carts
    // TODO: Remove this check after implementation of shop-by-shop discounts
    const Collection = Reaction.Collections[collection];
    const objectToApplyDiscount = Collection.findOne({ _id: id });
    const items = objectToApplyDiscount && objectToApplyDiscount.items;
    // loop through all items and filter down to unique shops (in order to get participating shops in the order/cart)
    const uniqueShopObj = items.reduce((shopObj, item) => {
      if (!shopObj[item.shopId]) {
        shopObj[item.shopId] = true;
      }
      return shopObj;
    }, {});
    const participatingShops = Object.keys(uniqueShopObj);

    if (participatingShops.length > 1) {
      throw new ReactionError("not-implemented", "discounts.multiShopError", "Discounts cannot be applied to a multi-shop cart or order");
    }

    const discount = Discounts.findOne({ code });
    if (!discount) throw new ReactionError("not-found", `No discount found for code ${code}`);

    const { conditions } = discount;
    let accountLimitExceeded = false;
    let discountLimitExceeded = false;

    // existing usage count
    if (discount.transactions) {
      const users = Array.from(discount.transactions, (trans) => trans.userId);
      const transactionCount = new Map([...new Set(users)].map((userX) => [userX, users.filter((userY) => userY === userX).length]));
      const orders = Array.from(discount.transactions, (trans) => trans.cartId);
      userCount = transactionCount.get(Reaction.getUserId());
      orderCount = orders.length;
    }
    // check limits
    if (conditions) {
      if (conditions.accountLimit) accountLimitExceeded = conditions.accountLimit <= userCount;
      if (conditions.redemptionLimit) discountLimitExceeded = conditions.redemptionLimit <= orderCount;
    }

    // validate basic limit handling
    if (accountLimitExceeded === true || discountLimitExceeded === true) {
      return { i18nKeyLabel: "Code is expired", i18nKey: "discounts.codeIsExpired" };
    }

    const now = new Date();
    const result = Collection.update({
      _id: id
    }, {
      $addToSet: {
        billing: {
          _id: Random.id(),
          amount: discount.discount,
          createdAt: now,
          currencyCode: objectToApplyDiscount.currencyCode,
          data: {
            discountId: discount._id,
            code: discount.code
          },
          displayName: `Discount Code: ${discount.code}`,
          method: discount.calculation.method,
          mode: "discount",
          name: "discount_code",
          paymentPluginName: "discount-codes",
          processor: discount.discountMethod,
          shopId: objectToApplyDiscount.shopId,
          status: "created",
          transactionId: Random.id()
        }
      }
    });

    if (collection === "Cart") {
      const updatedCart = Collection.findOne({ _id: id });
      Promise.await(appEvents.emit("afterCartUpdate", updatedCart));
    }

    return result;
  }
};

// export methods to Meteor
Meteor.methods(methods);
