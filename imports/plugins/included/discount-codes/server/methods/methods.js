import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Random } from "meteor/random";
import { Reaction, Hooks } from "/server/api";
import { Cart } from "/lib/collections";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections";
import { DiscountCodes as DiscountSchema } from "../../lib/collections/schemas";

// attach discount code specific schema
Discounts.attachSchema(DiscountSchema, { selector: { discountMethod: "code" } });

//
// make all discount methods available
//
export const methods = {
  /**
   * discounts/codes/discount
   * calculates percentage off discount rates
   * we intentionally passed ids, instead
   * of the cart,discount Object
   * for a smaller request providing an
   * additional level of validation.
   * @param  {String} cartId cartId
   * @param  {String} discountId discountId
   * @return {Number} returns discount total
   */
  "discounts/codes/discount"(cartId, discountId) {
    check(cartId, String);
    check(discountId, String);
    let discount = 0;
    const discountMethod = Discounts.findOne(discountId);
    const cart = Cart.findOne(cartId);

    for (const item of cart.items) {
      const preDiscount = item.quantity * item.variants.price;
      discount += preDiscount * discountMethod.discount / 100;
    }

    return discount;
  },
  /**
   * TODO discounts/codes/credit
   * calculates a credit off cart
   * for discount codes
   * @param  {String} cartId cartId
   * @param  {String} discountId discountId
   * @return {Number} returns discount total
   */
  "discounts/codes/credit"(cartId, discountId) {
    check(cartId, String);
    check(discountId, String);
    let discount = 0;
    const discountMethod = Discounts.findOne(discountId);
    ({ discount } = discountMethod);
    return discount;
  },
  /**
   * TODO discounts/codes/sale
   * calculates a new price for an item
   * @param  {String} cartId cartId
   * @param  {String} discountId discountId
   * @return {Number} returns discount total
   */
  "discounts/codes/sale"(cartId, discountId) {
    check(cartId, String);
    check(discountId, String);
    let discount = 0;
    const discountMethod = Discounts.findOne(discountId);
    const cart = Cart.findOne(cartId);

    // TODO add item specific conditions to sale calculations.
    for (const item of cart.items) {
      const preDiscountItemTotal = item.quantity * item.variants.price;
      const salePriceItemTotal = item.quantity * discountMethod.discount;
      // we if the sale is below 0, we won't discount at all. that's invalid.
      discount += Math.max(0, preDiscountItemTotal - salePriceItemTotal);
    }

    return discount;
  },
  /**
   * TODO discounts/codes/shipping
   * calculates a discount based on the value
   * of a calculated shipping rate in the cart.
   * @param  {String} cartId cartId
   * @param  {String} discountId discountId
   * @return {Number} returns discount total
   */
  "discounts/codes/shipping"(cartId, discountId) {
    check(cartId, String);
    check(discountId, String);
    let discount = 0;
    const discountMethod = Discounts.findOne(discountId);
    const cart = Cart.findOne(cartId);

    for (const shipping of cart.shipping) {
      if (shipping.shipmentMethod && shipping.shipmentMethod.name === discountMethod.discount) {
        discount += Math.max(0, shipping.shipmentMethod.rate);
      }
    }

    return discount;
  },

  /**
   * @name discounts/addCode
   * @method
   * @param  {Object} doc A Discounts document to be inserted
   * @param  {String} [docId] DEPRECATED. Existing ID to trigger an update. Use discounts/editCode method instead.
   * @return {String} Insert result
   */
  "discounts/addCode"(doc, docId) {
    check(doc, Object); // actual schema validation happens during insert below

    // Backward compatibility
    check(docId, Match.Optional(String));
    if (docId) return Meteor.call("discounts/editCode", { _id: docId, modifier: doc });

    if (!Reaction.hasPermission("discount-codes")) throw new Meteor.Error("access-denied", "Access Denied");
    return Discounts.insert(doc);
  },

  /**
   * @name discounts/editCode
   * @method
   * @param  {Object} details An object with _id and modifier props
   * @return {String} Update result
   */
  "discounts/editCode"(details) {
    check(details, {
      _id: String,
      modifier: Object // actual schema validation happens during update below
    });
    if (!Reaction.hasPermission("discount-codes")) throw new Meteor.Error("access-denied", "Access Denied");
    const { _id, modifier } = details;
    return Discounts.update(_id, modifier);
  },

  /**
   * discounts/codes/remove
   * removes discounts that have been previously applied
   * to a cart.
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
    //
    // delete code from cart
    //
    const cart = Collection.findOne(id);
    let hasInvoice = false;
    let currentDiscount = 0;
    for (const billing of cart.billing) {
      if (billing.paymentMethod && billing.paymentMethod.processor === "code" && billing._id !== codeId) {
        currentDiscount += parseFloat(billing.paymentMethod.amount);
      }
      if (billing.paymentMethod && billing.invoice) {
        hasInvoice = true;
      }
    }
    // only if this is an order
    if (hasInvoice) {
      const selector = {
        "_id": id,
        "billing._id": cart.billing[0]._id
      };
      const update = {
        $set: {
          "billing.$.invoice.discounts": currentDiscount
        }
      };
      Collection.update(selector, update);
    }
    // TODO: update a history record of transaction
    const result = Collection.update(
      { _id: id },
      { $set: { discount: currentDiscount }, $pull: { billing: { _id: codeId } } },
      { multi: true }
    );

    // calculate discounts
    Hooks.Events.run("afterCartUpdateCalculateDiscount", id);

    return result;
  },
  /**
   * discounts/codes/apply
   * checks validity of code conditions and then
   * applies a discount as a paymentMethod to cart
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

    // TODO: further expand to meet all condition rules
    // const conditions = {
    //   enabled: true
    // };

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
      throw new Meteor.Error("not-implemented", "discounts.multiShopError", "Discounts cannot be applied to a multi-shop cart or order");
    }

    // TODO: add  conditions: conditions
    const discount = Discounts.findOne({ code });

    // TODO: check usage limit
    // don't apply if cart has exceeded usage limit
    // will also need to check all time usage.
    // which means storing the use data with the Discounts
    // or searching all user's order history
    // and if a user cancels an order,
    // is the discount now re-activated

    if (discount) {
      const { conditions } = discount;
      let accountLimitExceeded = false;
      let discountLimitExceeded = false;

      // existing usage count
      if (discount.transactions) {
        const users = Array.from(discount.transactions, (t) => t.userId);
        const transactionCount = new Map([...new Set(users)].map((x) => [x, users.filter((y) => y === x).length]));
        const orders = Array.from(discount.transactions, (t) => t.cartId);
        userCount = transactionCount.get(Meteor.userId());
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

      // save to payment methods
      // and update status in Discounts
      // payment methods can be debit or credit.
      const paymentMethod = {
        id: discount._id,
        processor: discount.discountMethod,
        method: discount.calculation.method,
        code: discount.code,
        transactionId: Random.id(),
        amount: discount.discount, // pre-process to amount.
        status: "created"
      };
      return Meteor.call("payments/apply", id, paymentMethod, collection);
    }
  }
};

// export methods to Meteor
Meteor.methods(methods);
