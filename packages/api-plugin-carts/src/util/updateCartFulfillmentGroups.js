import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Figures out from which fulfillment groups the item should be removed
 * @param {Object[]} currentGroups The current cart fulfillment groups array
 * @param {String} itemId Id of the item to be removed
 * @param {String} shopId The ID of the shop that owns the item (product)
 * @returns {Object[]|null} The groups array or null if no viable group
 */
function determineRemoveFromGroups(currentGroups, itemId, shopId) {
  let removeFromGroups = currentGroups.map((group) => {
    if (group.itemIds && group.itemIds.includes(itemId) && shopId === group.shopId) {
      return group;
    }
    return null;
  });
  removeFromGroups = removeFromGroups.filter((group) => !!group); // remove nulls
  // If the item is present in more that one Fulfillment group, we remove it from all(for backward compatibility)
  return removeFromGroups || null;
}

/**
 * @summary Figures out which fulfillment group a cart item should be added to
 * @param {Object[]} currentGroups The current cart fulfillment groups array
 * @param {String[]} selectedFulfillmentType Selected Fulfillment type for the item
 * @param {String} shopId The ID of the shop that owns the item (product)
 * @returns {Object|null} The group or null if no viable group
 */
function determineAddToGroup(currentGroups, selectedFulfillmentType, shopId) {
  const compatibleGroup = currentGroups.find((group) => selectedFulfillmentType === group.type &&
    shopId === group.shopId);
  return compatibleGroup || null;
}

/**
 * @summary Check if the provided fulfillment type is present in any of the groups and adds if not
 * @param {Object[]} currentGroups The current cart fulfillment groups array
 * @param {String} fulfillmentType Specific fulfillment type to be checked
 * @param {Object} item The item (product) object
 * @returns {undefined}
 */
function checkAndAddToGroup(currentGroups, fulfillmentType, item) {
  let removeFromGroups = determineRemoveFromGroups(currentGroups, item._id, item.shopId);
  if (removeFromGroups && removeFromGroups.length > 0) {
    removeFromGroups = (removeFromGroups || []).map((group) => {
      group.itemIds = (group.itemIds || []).filter((itemId) => item._id !== itemId);
      return group;
    });
  }

  const addToGroup = determineAddToGroup(currentGroups, fulfillmentType, item.shopId);
  if (!addToGroup) {
    // If no compatible group, add one with initially just this item in it
    currentGroups.push({
      _id: Random.id(),
      itemIds: [item._id],
      shopId: item.shopId,
      type: fulfillmentType
    });
  } else if (!addToGroup.itemIds) {
    // If there is a compatible group but it has no items array, add one with just this item in it
    addToGroup.itemIds = [item._id];
  } else if (!addToGroup.itemIds.includes(item._id)) {
    // If there is a compatible group with an items array but it is missing this item, add this item ID to the array
    addToGroup.itemIds.push(item._id);
  }
}

/**
 * @summary Updates the `shipping` property on a `cart`
 * @param {Object} context App context
 * @param {Object} cart The cart, to be mutated
 * @returns {undefined}
 */
export default async function updateCartFulfillmentGroups(context, cart) {
  // Every time the cart is updated, create any missing fulfillment groups as necessary.
  // We need one group per type per shop, containing only the items from that shop.
  // Also make sure that every item is assigned to a fulfillment group.
  const { collections } = context;
  const { Fulfillment } = collections;
  const currentGroups = cart.shipping || [];

  for (const item of (cart.items || [])) {
    let { supportedFulfillmentTypes } = item;

    // This is a new optional field that UI can pass in case the user selects fulfillment type
    // for each item in the product details page instead of waiting till checkout
    let { selectedFulfillmentType } = item;

    if (!supportedFulfillmentTypes || supportedFulfillmentTypes.length === 0) {
      if (!cart.cartVersion) {
        supportedFulfillmentTypes = ["shipping"]; // we use 'shipping' as default fulfillment type for old v1 carts (prior to fulfillment types)
      } else {
        throw new ReactionError("not-found", "Product does not have any supported FulfillmentTypes");
      }
    }

    if (selectedFulfillmentType && !supportedFulfillmentTypes.includes(selectedFulfillmentType)) {
      throw new ReactionError("not-found", "Selected fulfillmentType is not supported by the Product");
    }

    // When selectedFulfillmentType is not available, if the product only supports ONE fulfillment type, use that
    // If more than one fulfillment type is available, then add item to undecided group
    if (!selectedFulfillmentType) {
      if (supportedFulfillmentTypes.length === 1) {
        ([selectedFulfillmentType] = supportedFulfillmentTypes);
      } else {
        selectedFulfillmentType = "undecided";
      }
    }
    // check if the selectedFulfillmentType is an 'enabled' fulfillmentType, if not set is 'undecided'
    /* eslint-disable no-await-in-loop */
    const enabledFulfillmentTypeObjs = await Fulfillment.find({ "shopId": item.shopId, "provider.enabled": true }).toArray();
    /* eslint-enable no-await-in-loop */
    let enabledFulfillmentTypes = (enabledFulfillmentTypeObjs || []).map((ffType) => ffType.fulfillmentType);
    enabledFulfillmentTypes = (enabledFulfillmentTypes || []).filter((val) => !!val); // Remove nulls
    if (!enabledFulfillmentTypes.includes(selectedFulfillmentType)) selectedFulfillmentType = "undecided";

    checkAndAddToGroup(currentGroups, selectedFulfillmentType, item);
  }

  // Items may also have been removed. Need to remove their IDs from each group.itemIds
  currentGroups.forEach((group) => {
    group.itemIds = (group.itemIds || []).filter((itemId) => !!cart.items.find((item) => item._id === itemId));
  });

  cart.shipping = currentGroups;
}
