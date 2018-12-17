import Random from "@reactioncommerce/random";
import rawCollections from "/imports/collections/rawCollections";

/**
 * @name migrateTagNav
 * @summary Migrates the existing tag nav items to a navigation tree
 * @param {String} shopId Shop navigation tree belongs to
 * @param {String} treeId Navigation tree _id
 * @return {Undefined} undefined
 */
export default async function migrateTagNav(shopId, treeId) {
  const { NavigationTrees, Shops } = rawCollections;
  const shop = await Shops.findOne({ _id: shopId });
  const treeItems = await getTreeItemsForTags(shop, treeId);

  await NavigationTrees.updateOne({ _id: treeId }, {
    $set: {
      items: treeItems,
      draftItems: treeItems,
      hasUnpublishedChanges: false
    }
  });
}

/**
 * @name getTreeItemsForTags
 * @private
 * @summary Builds and returns a navigation tree structure for tags in a shop
 * @param {Object} shop Shop to load tags for
 * @param {String} treeId Navigation Tree _id
 * @param {Array} [childTagIds] A tag's child tag _ids (used when function recursively calls itself)
 * @return {Array} Navigation tree items
 */
async function getTreeItemsForTags(shop, treeId, childTagIds = []) {
  const { Tags } = rawCollections;
  const { _id: shopId, language } = shop;

  const selector = {
    shopId,
    isVisible: true,
    isDeleted: false,
    isTopLevel: !childTagIds.length
  };
  const options = {};
  if (selector.isTopLevel) {
    options.sort = {
      position: 1
    };
  } else {
    options.sort = {
      created: 1
    };
  }
  if (childTagIds.length) {
    selector._id = {
      $in: childTagIds
    };
  }

  const tags = await Tags.find(selector, options).toArray();

  const treeItems = await Promise.all(tags.map(async (tag) => {
    const { relatedTagIds = [] } = tag;
    const treeItem = await createTagNavItem(tag, language, treeId);

    if (relatedTagIds.length) {
      const childTreeItems = await getTreeItemsForTags(shop, treeId, relatedTagIds);
      treeItem.items = childTreeItems;
    }

    return treeItem;
  }));

  return treeItems;
}

/**
 * @name createTagNavItem
 * @private
 * @summary Creates a navigation item and returns an object to be saved to the navigation tree
 * @param {Object} tag Tag item should be created for
 * @param {String} language Shop language
 * @param {String} treeId Navigation tree _id
 * @return {Object} Navigation tree item
 */
async function createTagNavItem(tag, language, treeId) {
  const { NavigationItems } = rawCollections;
  const { _id: tagId, name, slug } = tag;
  const navigationItemId = Random.id();
  const navigationItemData = {
    content: [{
      language,
      value: name
    }],
    url: `/tag/${slug}`,
    isUrlRelative: true,
    shouldOpenInNewWindow: false
  };
  const navigationItem = {
    _id: navigationItemId,
    data: navigationItemData,
    draftData: navigationItemData,
    metadata: {
      tagId
    },
    treeIds: [treeId],
    createdAt: new Date(),
    hasUnpublishedChanges: false
  };

  await NavigationItems.insertOne(navigationItem);

  const treeItem = {
    navigationItemId,
    items: []
  };

  return treeItem;
}
