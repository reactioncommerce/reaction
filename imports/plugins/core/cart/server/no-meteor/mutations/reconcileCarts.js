import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Cart as CartSchema } from "/imports/collections/schemas";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";
import addCartItems from "../util/addCartItems";

/**
 * @summary Delete anon cart and return accountCart
 * @private
 * @param {Object} accountCart The account cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {MongoDB.Collection} Cart The Cart collection
 * @return {Object} The account cart
 */
async function handleKeepAccountCart({ accountCart, anonymousCartSelector, Cart }) {
  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new Meteor.Error("server-error", "Unable to delete anonymous cart");
  return accountCart;
}

/**
 * @summary Update account cart to have only the anonymous cart items, delete anonymous
 *   cart, and return updated accountCart.
 * @todo When we add a "save for later" / "wish list" feature, we may want to update this
 *   to move existing account cart items to there.
 * @private
 * @param {Object} accountCart The account cart document
 * @param {Object} accountCartSelector The MongoDB selector for the account cart
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {MongoDB.Collection} Cart The Cart collection
 * @return {Object} The account cart
 */
async function handleKeepAnonymousCart({ accountCart, accountCartSelector, anonymousCart, anonymousCartSelector, Cart }) {
  const updatedAt = new Date();

  const modifier = {
    $set: {
      items: anonymousCart.items,
      updatedAt
    }
  };
  CartSchema.validate(modifier, { modifier: true });

  const { modifiedCount } = await Cart.updateOne(accountCartSelector, modifier);
  if (modifiedCount === 0) throw new Meteor.Error("server-error", "Unable to update cart");

  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new Meteor.Error("server-error", "Unable to delete anonymous cart");

  return {
    ...accountCart,
    items: anonymousCart.items,
    updatedAt
  };
}

/**
 * @summary Update account cart to have only the anonymous cart items, delete anonymous
 *   cart, and return updated accountCart.
 * @todo When we add a "save for later" / "wish list" feature, we may want to update this
 *   to move existing account cart items to there.
 * @private
 * @param {Object} accountCart The account cart document
 * @param {Object} accountCartSelector The MongoDB selector for the account cart
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {Object} collections A map of MongoDB collection instances
 * @return {Object} The account cart
 */
async function handleMergeCarts({ accountCart, accountCartSelector, anonymousCart, anonymousCartSelector, collections }) {
  const { Cart } = collections;

  // Convert item schema to input item schema
  const itemsInput = (anonymousCart.items || []).map((item) => ({
    metafields: item.metafields,
    productConfiguration: {
      productId: item.productId,
      productVariantId: item.variantId
    },
    quantity: item.quantity
  }));

  // Merge the item lists
  const { updatedItemList: items } = await addCartItems(collections, accountCart.items, itemsInput, { skipPriceCheck: true });

  // Update account cart
  const updatedAt = new Date();

  const modifier = {
    $set: {
      items,
      updatedAt
    }
  };
  CartSchema.validate(modifier, { modifier: true });

  const { modifiedCount } = await Cart.updateOne(accountCartSelector, modifier);
  if (modifiedCount === 0) throw new Meteor.Error("server-error", "Unable to update cart");

  // Delete anonymous cart
  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new Meteor.Error("server-error", "Unable to delete anonymous cart");

  return {
    ...accountCart,
    items,
    updatedAt
  };
}

/**
 * @summary Copy items from an anonymous cart into a new account cart, and then delete the
 *   anonymous cart.
 * @private
 * @param {String} accountId The account ID to associate with the new account cart
 * @param {Object} anonymousCart The anonymous cart document
 * @param {Object} anonymousCartSelector The MongoDB selector for the anonymous cart
 * @param {MongoDB.Collection} Cart The Cart collection
 * @param {String} shopId The shop ID to associate with the new account cart
 * @return {Object} The new account cart
 */
async function handleConvertAnonymousCartToNewAccountCart({ accountId, anonymousCart, anonymousCartSelector, Cart, shopId }) {
  const createdAt = new Date();
  const newCart = {
    _id: Random.id(),
    accountId,
    anonymousAccessToken: null,
    // We will set this billing currency stuff right away because historical Meteor code did it.
    // If this turns out to not be necessary, we should remove it.
    billing: [
      {
        _id: Random.id(),
        currency: { userCurrency: anonymousCart.currencyCode }
      }
    ],
    currencyCode: anonymousCart.currencyCode,
    createdAt,
    items: anonymousCart.items,
    shopId,
    updatedAt: createdAt,
    workflow: {
      status: "new"
    }
  };

  CartSchema.validate(newCart);

  const { ops, result } = await Cart.insertOne(newCart);
  if (result.ok !== 1) throw new Meteor.Error("server-error", "Unable to create account cart");

  const { deletedCount } = await Cart.deleteOne(anonymousCartSelector);
  if (deletedCount === 0) throw new Meteor.Error("server-error", "Unable to delete anonymous cart");

  return ops[0];
}

/**
 * @method reconcileCarts
 * @summary Call this with account credentials, passing in an anonymous cart, and the
 *   anonymous cart will be merged into the account cart. The "mode" argument allows
 *   you to specify whether the items should be merged, or if items should be kept from
 *   just one of the carts. If this mutation does not throw an error, the anonymous cart
 *   will be destroyed by the time this function returns.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @param {String} input.anonymousCartId - The anonymous cart ID
 * @param {String} input.anonymousCartToken - The anonymous cart token
 * @param {String} [input.mode] - The reconciliation mode, "merge", "keepAccountCart", or "keepAnonymousCart". Default "merge"
 * @param {String} shopId - The ID of the shop that owns both carts
 * @return {Promise<Object>} Object in which `cart` property is set to the updated account cart
 */
export default async function reconcileCarts(context, input) {
  const { accountId, collections } = context;
  const { Cart } = collections;
  const { anonymousCartId, anonymousCartToken, mode = "merge", shopId } = input;

  if (!accountId) throw new Meteor.Error("access-denied", "Access Denied");
  if (!anonymousCartId) throw new Meteor.Error("invalid-param", "anonymousCartId is required");
  if (!anonymousCartToken) throw new Meteor.Error("invalid-param", "anonymousCartToken is required");
  if (!shopId) throw new Meteor.Error("invalid-param", "shopId is required");

  const accountCartSelector = { accountId, shopId };
  const anonymousCartSelector = { _id: anonymousCartId, shopId, token: hashLoginToken(anonymousCartToken) };

  const carts = await Cart.find({
    $or: [accountCartSelector, anonymousCartSelector]
  }).toArray();

  const anonymousCart = carts.find((cart) => cart._id === anonymousCartId);
  if (!anonymousCart) throw new Meteor.Error("not-found", "Anonymous cart not found");

  const accountCart = carts.find((cart) => cart.accountId === accountId);

  if (accountCart) {
    // We have both carts, so reconcile them according to "mode"
    switch (mode) {
      case "keepAccountCart":
        return {
          cart: handleKeepAccountCart({ accountCart, anonymousCartSelector, Cart })
        };

      case "keepAnonymousCart":
        return {
          cart: handleKeepAnonymousCart({ accountCart, accountCartSelector, anonymousCart, anonymousCartSelector, Cart })
        };

      case "merge":
        return {
          cart: handleMergeCarts({ accountCart, accountCartSelector, anonymousCart, anonymousCartSelector, collections })
        };

      default:
        throw new Meteor.Error("invalid-param", "mode must be keepAccountCart, keepAnonymousCart, or merge");
    }
  }

  // We have only an anonymous cart, so convert it to an account cart
  return {
    cart: handleConvertAnonymousCartToNewAccountCart({ accountId, anonymousCart, anonymousCartSelector, Cart, shopId })
  };
}
