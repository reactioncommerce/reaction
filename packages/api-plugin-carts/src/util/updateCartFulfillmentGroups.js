import _ from "lodash";
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
  const removeFromGroups = currentGroups.map((group) => {
    if (group.itemIds?.includes?.(itemId) && shopId === group.shopId) {
      return group;
    }
    return null;
  });
  return _.compact(removeFromGroups);
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
  const removeFromGroups = determineRemoveFromGroups(currentGroups, item._id, item.shopId);
  removeFromGroups.forEach((group) => {
    group.itemIds = _.pull(group.itemIds, item._id);
  });

  const addToGroup = determineAddToGroup(currentGroups, fulfillmentType, item.shopId);
  if (!addToGroup) {
    // If no compatible group, add one with initially just this item in it
    currentGroups.push({
      _id: Random.id(),
      itemIds: [item._id],
      shopId: item.shopId,
      type: fulfillmentType
    });
  } else {
    // If compatible group, add this item to itemIds array of that group if not already present
    addToGroup.itemIds = _.uniq([...addToGroup.itemIds || [], item._id]);
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
  const { collections: { Fulfillment } } = context;
  const currentGroups = cart.shipping || [];

  for (const item of (cart.items || [])) {
    let { supportedFulfillmentTypes } = item;

    // This is a new optional field that UI can pass in case the user selects fulfillment type
    // for each item in the product details page instead of waiting till checkout
    let { selectedFulfillmentType } = item;

    if (!supportedFulfillmentTypes || supportedFulfillmentTypes.length === 0) {
      if (!cart.fulfillmentCartVersion) {
        supportedFulfillmentTypes = ["shipping"]; // we use 'shipping' as default fulfillment type for old v1 carts (prior to fulfillment types)
      } else {
        throw new ReactionError("not-found", "Product does not have any supported FulfillmentTypes");
      }
    }

    const normalizeSelectedFulfillmentType = (selectedFulfillmentTypeInp) => {
      // When selectedFulfillmentTypeInp is not available, if the product only supports ONE fulfillment type, use that
      // If more than one fulfillment type is available, then add item to undecided group
      if (_.isNil(selectedFulfillmentTypeInp)) {
        const hasOnlyOneSupportedFulfillmentType = supportedFulfillmentTypes.length === 1;
        if (hasOnlyOneSupportedFulfillmentType) return _.first(supportedFulfillmentTypes);
        return "undecided";
      }
      if (!supportedFulfillmentTypes.includes(selectedFulfillmentTypeInp)) {
        throw new ReactionError("not-found", "Selected fulfillmentType is not supported by the Product");
      }
      return selectedFulfillmentTypeInp;
    };

    selectedFulfillmentType = normalizeSelectedFulfillmentType(selectedFulfillmentType);

    // check if the selectedFulfillmentType is an 'enabled' fulfillmentType, if not set is 'undecided'
    /* eslint-disable no-await-in-loop */
    const enabledFulfillmentType = await Fulfillment.findOne({ "shopId": item.shopId, "provider.enabled": true, "fulfillmentType": selectedFulfillmentType });
    /* eslint-enable no-await-in-loop */
    if (!enabledFulfillmentType) selectedFulfillmentType = "undecided";

    checkAndAddToGroup(currentGroups, selectedFulfillmentType, item);
  }

  // Items may also have been removed. Need to remove their IDs from each group.itemIds
  currentGroups.forEach((group) => {
    group.itemIds = (group.itemIds || []).filter((itemId) => !!cart.items.find((item) => item._id === itemId));
  });

  cart.shipping = currentGroups;
}
