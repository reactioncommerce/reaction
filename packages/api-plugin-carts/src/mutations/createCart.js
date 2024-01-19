import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";
import { fulfillmentCartVersion } from "../fulfillmentCartVersion.js";
import addCartItems from "../util/addCartItems.js";

/**
 * @method createCart
 * @summary Create a new cart for a shop with an initial list of items in it.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @param {String} input.items - An array of cart items to add to the new cart. Must not be empty.
 * @param {String} input.shopId - The ID of the shop that will own this cart
 * @param {Boolean} [input.shouldCreateWithoutItems] - Create even if `items` is empty or becomes empty
 *   due to price mismatches? Default is false. This is for backwards compatibility with old Meteor code
 *   that creates the cart prior to adding items and should not be set to `true` in new code.
 * @returns {Promise<Object>} An object with `cart`, `minOrderQuantityFailures`, and `incorrectPriceFailures` properties.
 *   `cart` will be null if all prices were incorrect. If at least one item could be added,
 *   then the cart will have been created and returned, but `incorrectPriceFailures` and
 *   `minOrderQuantityFailures` may still contain other failures that the caller should
 *   optionally retry with the correct price or quantity.
 */
export default async function createCart(context, input) {
  const { items, shopId, shouldCreateWithoutItems = false } = input;
  const { collections, accountId = null, getFunctionsOfType } = context;
  const { Cart, Shops } = collections;

  if (shouldCreateWithoutItems !== true && (!Array.isArray(items) || !items.length)) {
    throw new ReactionError("invalid-param", "A cart may not be created without at least one item in it");
  }

  // If we have an accountId and that account already has a cart for this shop, throw
  if (accountId) {
    const existingCart = await Cart.findOne({ accountId, shopId }, { projection: { _id: 1 } });

    if (existingCart) {
      throw new ReactionError("cart-found", "Each account may have only one cart per shop at a time");
    }
  }

  const {
    incorrectPriceFailures,
    minOrderQuantityFailures,
    updatedItemList
  } = await addCartItems(context, [], items);

  // If all input items were invalid, don't create a cart
  if (!updatedItemList.length && shouldCreateWithoutItems !== true) {
    return { cart: null, incorrectPriceFailures, minOrderQuantityFailures, token: null };
  }

  let anonymousAccessToken = null;
  if (!accountId) {
    anonymousAccessToken = Random.secret();
  }

  const shop = await Shops.findOne({ _id: shopId }, { projection: { currency: 1 } });
  const cartCurrencyCode = (shop && shop.currency) || "USD";


  const createdAt = new Date();
  const newCart = {
    _id: Random.id(),
    fulfillmentCartVersion,
    accountId,
    anonymousAccessToken: anonymousAccessToken && hashToken(anonymousAccessToken),
    currencyCode: cartCurrencyCode,
    createdAt,
    items: updatedItemList,
    shopId,
    updatedAt: createdAt,
    workflow: {
      status: "new"
    }
  };

  let referenceId;
  const createReferenceIdFunctions = getFunctionsOfType("createCartReferenceId");
  if (!createReferenceIdFunctions || createReferenceIdFunctions.length === 0) {
    referenceId = Random.id();
  } else {
    referenceId = await createReferenceIdFunctions[0](context, newCart);
    if (typeof referenceId !== "string") {
      throw new ReactionError("invalid-parameter", "createCartReferenceId returned a non-string value");
    }
    if (createReferenceIdFunctions.length > 1) {
      Logger.warn("More than one createCartReferenceId function defined. Using first one defined");
    }
  }

  newCart.referenceId = referenceId;

  const savedCart = await context.mutations.saveCart(context, newCart);

  return { cart: savedCart, incorrectPriceFailures, minOrderQuantityFailures, token: anonymousAccessToken };
}
