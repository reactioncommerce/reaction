import Random from "@reactioncommerce/random";
import rawCollections from "/imports/collections/rawCollections";

/**
 * @name createDefaultNavigationTree
 * @summary Creates a default navigation tree for a shop
 * @param {Object} shop Shop to create tree for
 * @param {String} name Name of navigation tree
 * @returns {String} Navigation tree _id
 */
export default async function createDefaultNavigationTree(shop, name) {
  const { NavigationTrees, Shops } = rawCollections;
  const { _id: shopId } = shop;

  // Create the tree
  const navigationTreeId = Random.id();
  const navigationTreeItems = [];
  await NavigationTrees.insertOne({
    _id: navigationTreeId,
    shopId,
    name,
    draftItems: navigationTreeItems,
    items: navigationTreeItems,
    hasUnpublishedChanges: false
  });

  await Shops.updateOne({ _id: shopId }, { $set: { defaultNavigationTreeId: navigationTreeId } });

  return navigationTreeId;
}
