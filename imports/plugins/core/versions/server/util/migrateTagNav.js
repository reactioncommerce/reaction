import Random from "@reactioncommerce/random";
import rawCollections from "/imports/collections/rawCollections";

/**
 * @name migrateTagNav
 * @summary Migrates the existing tag nav items to a navigation tree
 * @param {String} shopId Shop navigation tree belongs to
 * @param {String} treeId Navigation tree _id
 * @returns {Undefined} undefined
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
 * @param {Array} tags Cache of all visible tags in database. Used when function calls itself
 * @param {Array} [childTagIds] A tag's child tag _ids. Used when function recursively calls itself
 * @returns {Array} Navigation tree items
 */
async function getTreeItemsForTags(shop, treeId, tags = [], childTagIds = []) {
  const { Tags } = rawCollections;
  const { _id: shopId, language } = shop;

  if (!tags.length) {
    // First run, query for all visible tags
    const allTags = await Tags.find({
      shopId,
      isVisible: true,
      isDeleted: false
    }, {
      sort: {
        position: 1 // Position is only present on top-level tags
      }
    }).toArray();

    tags.push(...allTags);
  }

  const thisLevelTags = [];
  if (!childTagIds.length) {
    // Get top-level tags, ordered by position
    tags.forEach((tag) => {
      if (tag.isTopLevel) {
        thisLevelTags.push(tag);
      }
    });
  } else {
    // Get child tags, in order they are defined on parent
    childTagIds.forEach((childTagId) => {
      const childTag = tags.find((tag) => tag._id === childTagId);
      if (childTag) {
        thisLevelTags.push(childTag);
      }
    });
  }


  const treeItems = await Promise.all(thisLevelTags.map(async (tag) => {
    const { relatedTagIds = [] } = tag;
    const treeItem = await createTagNavItem(tag, language, treeId);

    if (relatedTagIds.length) {
      const childTreeItems = await getTreeItemsForTags(shop, treeId, tags, relatedTagIds);
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
 * @returns {Object} Navigation tree item
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
