import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Cart, MediaRecords } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * cart
 */

Meteor.publish("Cart", function (sessionId, userId) {
  check(sessionId, Match.OneOf(String, null));
  check(userId, Match.OptionalOrNull(String));
  // sessionId is required, not for selecting the cart, (userId), but as a key
  // in merging anonymous user carts into authenticated existing user carts.
  // we won't create carts unless we've got sessionId
  if (this.userId === null || sessionId === null) {
    return this.ready();
  }
  // use case happens between switching from anonymous to registered user. and
  // vice versa
  if (typeof userId === "string" && this.userId !== userId) {
    return this.ready();
  }
  // we have a very rare case when cart has not been created for an anonymous
  // and because of that, for some reason, he is considered as not logged in.
  // in that case he doesn't have `userId`. Only way for him to get userId is
  // to flush browser's session or log in as normal user. We could detect this
  // case from here by comparing this.userId is string and this.userId !==
  // Meteor.userId(). If this case will happens someday, we could try to send
  // some logout call to accounts. This is it: https://github.com/meteor/meteor/
  // issues/5103

  // shopId is also required.
  let shopId = Reaction.getPrimaryShopId();
  const marketplaceSettings = Reaction.getMarketplaceSettings();
  if (marketplaceSettings && marketplaceSettings.public && marketplaceSettings.public.merchantCart === true) {
    shopId = Reaction.getShopId();
  }

  if (!shopId) {
    return this.ready();
  }

  // exclude these fields
  // from the client cart
  const fields = {
    taxes: 0
  };

  // select user cart
  const cart = Cart.find({
    userId: this.userId,
    shopId
  }, {
    fields
  });

  if (cart.count()) {
    // we could keep `sessionId` of normal user up to date from here, but with
    // current session logic we don't need this. That's why we just return
    // cursor as is with whatever `sessionId`.
    return cart;
  }
  // we may create a cart if we didn't find one.
  const cartId = Meteor.call("cart/createCart", this.userId, sessionId);

  return Cart.find(cartId);
});


Meteor.publish("CartImages", (cartId) => {
  check(cartId, Match.Optional(String));
  if (!cartId) return [];

  const cart = Cart.findOne(cartId);
  const { items: cartItems } = cart || {};
  if (!Array.isArray(cartItems)) return [];

  // Ensure each of these are unique
  const productIds = [...new Set(cartItems.map((item) => item.product._id))];
  const variantIds = [...new Set(cartItems.map((item) => item.variants._id))];

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
