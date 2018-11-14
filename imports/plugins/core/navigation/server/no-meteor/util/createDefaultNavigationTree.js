import Random from "@reactioncommerce/random";
import rawCollections from "/imports/collections/rawCollections";

/**
 * @name createDefaultNavigationTree
 * @summary Creates a navigation tree with a single "Home" item and assigns it as the default for a shop
 * @param {Object} shop Shop to create tree for
 * @param {String} name Name of navigation tree
 * @return {Undefined} undefined
 */
export default async function createDefaultNavigationTree(shop, name) {
  const { NavigationItems, NavigationTrees, Shops } = rawCollections;
  const { _id: shopId, language } = shop;

  // Create a "Home" nav item
  const navigationItemId = Random.id();
  const navigationItemData = {
    content: [{
      language,
      value: "Home"
    }],
    url: "/",
    isUrlRelative: true,
    shouldOpenInNewWindow: false
  };
  await NavigationItems.insertOne({
    _id: navigationItemId,
    shopId,
    draftData: navigationItemData,
    data: navigationItemData,
    createdAt: new Date(),
    hasUnpublishedChanges: false
  });

  // Create the tree
  const navigationTreeId = Random.id();
  const navigationTreeItems = [{
    navigationItemId
  }];
  await NavigationTrees.insertOne({
    _id: navigationTreeId,
    shopId,
    name,
    draftItems: navigationTreeItems,
    items: navigationTreeItems,
    hasUnpublishedChanges: false
  });

  Shops.updateOne({ _id: shopId }, { $set: { defaultNavigationTreeId: navigationTreeId }});
}
