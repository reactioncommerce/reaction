import Random from "@reactioncommerce/random";

const DEFAULT_NAME = "Main Navigation";

/**
 * @name createDefaultNavigationTreeForShop
 * @summary Creates a default navigation tree for a shop
 * @param {Object} context App context
 * @param {Object} shop Shop to create tree for
 * @returns {String} Navigation tree _id
 */
export default async function createDefaultNavigationTreeForShop(context, shop) {
  const { collections: { NavigationTrees, Shops } } = context;
  const { _id: shopId } = shop;

  // Create the tree
  const navigationTreeId = Random.id();
  await NavigationTrees.insertOne({
    _id: navigationTreeId,
    draftItems: [],
    hasUnpublishedChanges: false,
    items: [],
    name: DEFAULT_NAME,
    shopId
  });

  await Shops.updateOne({ _id: shopId }, { $set: { defaultNavigationTreeId: navigationTreeId } });

  return navigationTreeId;
}
