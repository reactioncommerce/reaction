import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import { Accounts, Cart, MediaRecords } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

Meteor.publish("Cart", function (accountId, anonymousCarts, shopId) {
  check(accountId, Match.Maybe(String));
  check(anonymousCarts, Match.Maybe([Object]));
  check(shopId, Match.Maybe(String));

  const userId = Reaction.getUserId();
  let account;
  if (userId) {
    account = Accounts.findOne({ userId }, { fields: { _id: 1 } });
  }

  const selectorOr = [];

  // You can only see your own carts
  if (account && account._id === accountId) {
    const accountSelector = { accountId };
    if (shopId) {
      accountSelector.shopId = shopId;
    }
    selectorOr.push(accountSelector);
  }

  if (Array.isArray(anonymousCarts)) {
    anonymousCarts.forEach((anonymousCart) => {
      selectorOr.push({
        _id: anonymousCart._id,
        anonymousAccessToken: hashToken(anonymousCart.token)
      });
    });
  }

  if (selectorOr.length === 0) return this.ready();

  // exclude these fields from the client cart
  const fields = {
    anonymousAccessToken: 0,
    taxes: 0
  };

  return Cart.find({ $or: selectorOr }, { fields });
});

Meteor.publish("CartImages", (cartId) => {
  check(cartId, Match.Optional(String));
  if (!cartId) return [];

  const cart = Cart.findOne({ _id: cartId });
  const { items: cartItems } = cart || {};
  if (!Array.isArray(cartItems)) return [];

  // Ensure each of these are unique
  const productIds = [...new Set(cartItems.map((item) => item.productId))];
  const variantIds = [...new Set(cartItems.map((item) => item.variantId))];

  // return image for each the top level product or the variant and let the client code decide which to display
  return MediaRecords.find({
    "$or": [
      {
        "metadata.productId": {
          $in: productIds
        }
      },
      {
        "metadata.variantId": {
          $in: variantIds
        }
      }
    ],
    "metadata.workflow": {
      $nin: ["archived", "unpublished"]
    }
  });
});
