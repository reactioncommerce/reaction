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
  // or we're adding more quuantity
  if (modifier.$inc) {
    ReactionCore.Log.info("after variant increment, call inventory/addReserve");
    Meteor.call("inventory/addReserve", cart.items);
  }
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
ReactionCore.Collections.Products.after.update(function (userId, product,
  fieldNames, modifier) {
  if (modifier.$push) { // if we're adding a new product or variant
    Meteor.call("inventory/register", product);
  }

  // check if modifier is set and $pull and $push are undefined. This need
  // because anyway on every create or delete operation we have additionally
  // $set modifier because of auto-updating of `shopId` and `updateAt` schema
  // properties
  if (modifier.$set && !modifier.$pull && !modifier.$push) {
    modifier.$set.updatedAt = new Date();
    // triggers inventory adjustment
    Meteor.call("inventory/adjust", product);
  }
});
