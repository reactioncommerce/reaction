/**
 * ReactionCore Collection Hooks
 * transform collections based on events
 *
 * See: https://github.com/matb33/meteor-collection-hooks
 */

/**
 * After cart update
 */

ReactionCore.Collections.Cart.after.update(function (userId, cart, fieldNames,
  modifier) {
  // if we're adding a new product or variant to the cart
  if (modifier.$addToSet) {
    if (modifier.$addToSet.items) {
      ReactionCore.Log.info("after cart update, call inventory/addReserve");
      Meteor.call("inventory/addReserve", cart.items);
    }
  }
  // or we're adding more quantity
  if (modifier.$inc) {
    ReactionCore.Log.info("after variant increment, call inventory/addReserve");
    Meteor.call("inventory/addReserve", cart.items);
  }
});
/**
 * Before cart update. When Item is removed from Cart, release the inventory reservation.
 */

ReactionCore.Collections.Cart.before.update(function (userId, cart, fieldNames, modifier) {
  // removing  cart items, clear inventory reserve
  if (modifier.$pull) {
    if (modifier.$pull.items) {
      ReactionCore.Log.info("remove cart items, call inventory/clearReserve");
      Meteor.call("inventory/clearReserve", cart.items);
    }
  }
});

/**
 * after variant were removed
 * @fires `inventory/remove` Method
 */
ReactionCore.Collections.Products.after.remove(function (userId, doc) {
  if (doc.type === "variant") {
    const variantItem = {
      productId: doc.ancestors[0],
      variantId: doc._id,
      shopId: doc.shopId
    };
    ReactionCore.Log.info(`remove inventory variants for variant: ${doc._id
      }, call inventory/remove`);
    Meteor.call("inventory/remove", variantItem);
  }
});

//
// after product update
//
ReactionCore.Collections.Products.after.update(function (userId, doc,
  fieldNames, modifier) {
  // product update can't affect on inventory, so we don't manage this cases
  // we should keep in mind that returning false within hook prevents other
  // hooks to be run
  if (doc.type !== "variant") return false;

  // check if modifier is set and $pull and $push are undefined. This need
  // because anyway on every create or delete operation we have additionally
  // $set modifier because of auto-updating of `shopId` and `updateAt` schema
  // properties
  if ((modifier.$set || modifier.$inc) && !modifier.$pull && !modifier.$push) {
    if (!modifier.$set) {
      modifier.$set = {};
    }
    modifier.$set.updatedAt = new Date();
    // triggers inventory adjustment
    Meteor.call("inventory/adjust", doc);
  }
});

/**
 * after insert
 * @summary should fires on create new variants, on clones products/variants
 */
ReactionCore.Collections.Products.after.insert(function (userId, doc) {
  if (doc.type !== "variant") return false;
  Meteor.call("inventory/register", doc);
});
