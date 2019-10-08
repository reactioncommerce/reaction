import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import getCart from "../util/getCart.js";

const inputSchema = new SimpleSchema({
  cartId: String,
  discountCode: String,
  shopId: String,
  token: {
    type: String,
    optional: true
  }
});

/**
 * @method applyDiscountCodeToCart
 * @summary Applies a discount code to a cart
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {Object} input.cartId - Cart to add discount to
 * @param {Object} input.discountCode - Discount code to add to cart
 * @param {String} input.shopId - Shop cart belongs to
 * @param {String} [input.token] - Cart token, if anonymous
 * @returns {Promise<Object>} An object with the updated cart with the applied discount
 */
export default async function applyDiscountCodeToCart(context, input) {
  inputSchema.validate(input);

  const { cartId, discountCode, shopId, token } = input;
  const { collections, userHasPermission, userId } = context;
  const { Cart, Discounts } = collections;

  let userCount = 0;
  let orderCount = 0;
  let cart = await getCart(context, shopId, cartId, { cartToken: token, throwIfNotFound: false });

  // If we didn't find a cart, it means it belongs to another user,
  // not the currently logged in user.
  // Check to make sure current user has admin permission.
  if (!cart) {
    cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      throw new ReactionError("not-found", "Cart not found");
    }

    if (!userHasPermission(["owner", "admin", "discounts/apply"], shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }
  }

  const objectToApplyDiscount = cart;

  const discount = await Discounts.findOne({ code: discountCode });
  if (!discount) throw new ReactionError("not-found", `No discount found for code ${discountCode}`);

  const { conditions } = discount;
  let accountLimitExceeded = false;
  let discountLimitExceeded = false;

  // existing usage count
  if (discount.transactions) {
    const users = Array.from(discount.transactions, (trans) => trans.userId);
    const transactionCount = new Map([...new Set(users)].map((userX) => [userX, users.filter((userY) => userY === userX).length]));
    const orders = Array.from(discount.transactions, (trans) => trans.cartId);
    userCount = transactionCount.get(userId);
    orderCount = orders.length;
  }
  // check limits
  if (conditions) {
    if (conditions.accountLimit) accountLimitExceeded = conditions.accountLimit <= userCount;
    if (conditions.redemptionLimit) discountLimitExceeded = conditions.redemptionLimit <= orderCount;
  }

  // validate basic limit handling
  if (accountLimitExceeded === true || discountLimitExceeded === true) {
    throw new ReactionError("error-occurred", "Code is expired");
  }

  if (!cart.billing) {
    cart.billing = [];
  }

  cart.billing.push({
    _id: Random.id(),
    amount: discount.discount,
    createdAt: new Date(),
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
  });

  // Instead of directly updating cart, we add the discount billing
  // object from the existing cart, then pass to `saveCart`
  // to re-run cart through all transforms and validations.
  const savedCart = await context.mutations.saveCart(context, cart);

  return savedCart;
}
