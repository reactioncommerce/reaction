import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Figures out which fulfillment group a cart item should initially be in
 * @param {Object[]} currentGroups The current cart fulfillment groups array
 * @param {String[]} supportedFulfillmentTypes Array of fulfillment types supported by the item
 * @param {String} shopId The ID of the shop that owns the item (product)
 * @returns {Object|null} The group or null if no viable group
 */
function determineInitialGroupForItem(currentGroups, supportedFulfillmentTypes, shopId) {
  const compatibleGroup = currentGroups.find((group) => supportedFulfillmentTypes.indexOf(group.type) !== -1 &&
    shopId === group.shopId);
  return compatibleGroup || null;
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.appEvents App event emitter
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ appEvents, collections }) {
  const { Cart } = collections;

  const handler = async (cartId, updatedCart) => {
    if (!cartId) {
      throw new Error("afterCartUpdate hook run with no cartId argument");
    }

    if (typeof cartId !== "string") {
      throw new Error("afterCartUpdate hook run with non-string cartId argument");
    }

    if (!updatedCart) {
      throw new Error("afterCartUpdate hook run with no cart argument");
    }

    // Every time the cart is updated, create any missing fulfillment groups as necessary.
    // We need one group per type per shop, containing only the items from that shop.
    // Also make sure that every item is assigned to a fulfillment group.
    const currentGroups = updatedCart.shipping || [];

    let didModifyGroups = false;
    (updatedCart.items || []).forEach((item) => {
      let { supportedFulfillmentTypes } = item;
      if (!supportedFulfillmentTypes || supportedFulfillmentTypes.length === 0) {
        supportedFulfillmentTypes = ["shipping"];
      }

      const group = determineInitialGroupForItem(currentGroups, supportedFulfillmentTypes, item.shopId);
      if (!group) {
        // Add one
        didModifyGroups = true;
        currentGroups.push({
          _id: Random.id(),
          itemIds: [item._id],
          shopId: item.shopId,
          type: supportedFulfillmentTypes[0]
        });
      } else if (!group.itemIds) {
        didModifyGroups = true;
        group.itemIds = [item._id];
      } else if (group.itemIds.indexOf(item._id) === -1) {
        didModifyGroups = true;
        group.itemIds.push(item._id);
      }
    });

    if (!didModifyGroups) return;

    const modifier = { $set: { updatedAt: new Date() } };
    if (didModifyGroups) {
      modifier.$set.shipping = currentGroups;
    }

    const { modifiedCount } = await Cart.updateOne({ _id: cartId }, modifier);
    if (modifiedCount === 0) throw new ReactionError("server-error", "Failed to update cart");
  };

  appEvents.on("afterCartUpdate", handler);
  appEvents.on("afterCartCreate", (cart) => handler(cart._id, cart));
}
