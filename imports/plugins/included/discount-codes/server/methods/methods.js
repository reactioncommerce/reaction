import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { Reaction } from "/server/api";
import { Cart } from "/lib/collections";
import { Discounts } from  "/imports/plugins/core/discounts/lib/collections";
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
  "discounts/codes/discount": function (cartId, discountId) {
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
  "discounts/codes/credit": function (cartId, discountId) {
    check(cartId, String);
    check(discountId, String);
    let discount = 0;
    const discountMethod = Discounts.findOne(discountId);
    discount = discountMethod.discount;
    return discount;
  },
  /**
   * TODO discounts/codes/sale
   * calculates a new price for an item
   * @param  {String} cartId cartId
   * @param  {String} discountId discountId
   * @return {Number} returns discount total
   */
  "discounts/codes/sale": function (cartId, discountId) {
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
  "discounts/codes/shipping": function (cartId, discountId) {
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
   * discounts/addCode
   * @param  {String} modifier update statement
   * @param  {String} docId discount docId
   * @param  {String} qty create this many additional codes
   * @return {String} returns update/insert result
   */
  "discounts/addCode": function (modifier, docId) {
    check(modifier, Object);
    check(docId, Match.OneOf(String, null, undefined));

    // check permissions to add
    if (!Reaction.hasPermission("discount-codes")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // if no doc, insert
    if (!docId) {
      return Discounts.insert(modifier);
    }
    // else update and return
    return Discounts.update(docId, modifier);
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
  "discounts/codes/remove": function (id, codeId, collection = "Cart") {
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
    // TODO: recalculate cart discounts (not simply 0)
    return Collection.update(
      { _id: id },
      { $set: { discount: currentDiscount }, $pull: { billing: { _id: codeId } } },
      { multi: true }
    );
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
  "discounts/codes/apply": function (id, code, collection = "Cart") {
    check(id, String);
    check(code, String);
    check(collection, String);
    let userCount = 0;
    let orderCount = 0;

    // TODO: further expand to meet all condition rules
    // const conditions = {
    //   enabled: true
    // };

    // TODO: add  conditions: conditions
    const discount = Discounts.findOne({ code: code });

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
        const transactionCount = new Map([...new Set(users)].map(
          x => [x, users.filter(y => y === x).length]
        ));
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
