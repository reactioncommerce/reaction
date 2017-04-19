import { Cart, Products, Orders } from "/lib/collections";
import { Logger } from "/server/api";
import { registerInventory } from "../methods/inventory";

/**
 * Collection Hooks
 * transform collections based on events
 *
 * See: https://github.com/matb33/meteor-collection-hooks
 */

/**
 * After cart update
 */
Cart.after.update((userId, cart, fieldNames, modifier) => {
  // if we're adding a new product or variant to the cart
  if (modifier.$addToSet) {
    if (modifier.$addToSet.items) {
      Logger.debug("after cart update, call inventory/addReserve");
      Meteor.call("inventory/addReserve", cart.items);
    }
  }
  // or we're adding more quantity
  if (modifier.$inc) {
    Logger.debug("after variant increment, call inventory/addReserve");
    Meteor.call("inventory/addReserve", cart.items);
  }
});

/**
 * Before cart update. When Item is removed from Cart, release the inventory reservation.
 */
Cart.before.update((userId, cart, fieldNames, modifier) => {
  // removing  cart items, clear inventory reserve
  if (modifier.$pull) {
    if (modifier.$pull.items) {
      Logger.debug("remove cart items, call inventory/clearReserve");
      Meteor.call("inventory/clearReserve", cart.items);
    }
  }
});

/**
 * after variant were removed
 * @fires `inventory/remove` Method
 */
Products.after.remove((userId, doc) => {
  if (doc.type === "variant") {
    const variantItem = {
      productId: doc.ancestors[0],
      variantId: doc._id,
      shopId: doc.shopId
    };
    Logger.debug(`remove inventory variants for variant: ${doc._id
      }, call inventory/remove`);
    Meteor.call("inventory/remove", variantItem);
  }
});

//
// after product update
//
Products.after.update((userId, doc, fieldNames, modifier) => {
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
Products.after.insert((userId, doc) => {
  if (doc.type !== "variant") {
    return false;
  }
  registerInventory(doc);
});

function markInventoryShipped(doc) {
  const order = Orders.findOne(doc._id);
  const orderItems = order.items;
  const cartItems = [];
  for (const orderItem of orderItems) {
    const cartItem = {
      _id: orderItem.cartItemId || orderItem._id,
      shopId: orderItem.shopId,
      quantity: orderItem.quantity,
      productId: orderItem.productId,
      variants: orderItem.variants,
      title: orderItem.title
    };
    cartItems.push(cartItem);
  }
  Meteor.call("inventory/shipped", cartItems);
}

function markInventorySold(doc) {
  const orderItems = doc.items;
  const cartItems = [];
  // If a cartItemId exists it's a legacy order and we use that
  for (const orderItem of orderItems) {
    const cartItem = {
      _id: orderItem.cartItemId || orderItem._id,
      shopId: orderItem.shopId,
      quantity: orderItem.quantity,
      productId: orderItem.productId,
      variants: orderItem.variants,
      title: orderItem.title
    };
    cartItems.push(cartItem);
  }
  Meteor.call("inventory/sold", cartItems);
}

Orders.after.insert((userId, doc) => {
  Logger.debug("Inventory module handling Order insert");
  markInventorySold(doc);
});

Orders.after.update((userId, doc, fieldnames, modifier) => {
  Logger.debug("Inventory module handling Order update");
  if (modifier.$addToSet) {
    if (modifier.$addToSet["workflow.workflow"] === "coreOrderWorkflow/completed") {
      markInventoryShipped(doc);
    }
  }
});
