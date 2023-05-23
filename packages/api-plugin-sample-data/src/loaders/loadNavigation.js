import Random from "@reactioncommerce/random";
import NavigationItemsData from "../json-data/NavigationItems.json" assert { type: "json" };

const DEFAULT_NAME = "Main Navigation";

/**
 * @summary Create a single Navigation entry
 * @param {String} navigationItemId - The ID for the navigation entry
 * @returns {Object} The navigation entry
 */
function getNavigationItem(navigationItemId) {
  return {
    isPrivate: false,
    isSecondary: false,
    isVisible: true,
    navigationItemId
  };
}

/**
 * @summary Deletes all default Navigation entries created by afterShopCreate event
 * @param {Object} context - The application context
 * @param {String} shopId - The shop id
 * @returns {Promise<boolean>} true if success
 */
async function deleteDefaultNavigation(context, shopId) {
  const { collections: { NavigationItems, NavigationTrees } } = context;
  const defaultNavigationItems = await NavigationItems.find({
    shopId
  }).toArray();
  if (defaultNavigationItems.length > 0) {
    await NavigationItems.deleteMany({
      shopId
    });
  }
  const defaultNavigationTreeItem = await NavigationTrees.find({
    shopId
  }).toArray();
  if (defaultNavigationTreeItem.length > 0) {
    await NavigationTrees.deleteMany({
      shopId
    });
  }
  return true;
}

/**
 * @summary load Navigation data
 * @param {Object} context - The application context
 * @param {String} shopId - The shop id
 * @returns {Promise<boolean>} true if success
 */
export default async function loadNavigation(context, shopId) {
  const { collections: { NavigationTrees, Shops } } = context;

  // delete default navigation items & tree
  await deleteDefaultNavigation(context, shopId);

  Object.keys(NavigationItemsData).forEach((navItem) => {
    NavigationItemsData[navItem].shopId = shopId;
  });

  // Hardcoded Sample Navigation Items
  // Two sections (Men/Women) each with a sub-level and leaf item
  const navItemMenuOneTopLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuOneTopLevel
  });
  const navItemMenuOneSubLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuOneSubLevel
  });
  const navItemMenuOneLeafLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuOneLeafLevel
  });
  const navItemMenuTwoTopLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuTwoTopLevel
  });
  const navItemMenuTwoSubLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuTwoSubLevel
  });
  const navItemMenuTwoLeafLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuTwoLeafLevel
  });
  const navItemMenuThreeTopLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuThreeTopLevel
  });
  const navItemMenuThreeSubLevel = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: NavigationItemsData.MenuThreeSubLevel
  });

  // Create Navigation item objects with corresponding IDs
  const m1leaf = getNavigationItem(navItemMenuOneLeafLevel._id);
  const m1sub = getNavigationItem(navItemMenuOneSubLevel._id);
  const m1top = getNavigationItem(navItemMenuOneTopLevel._id);
  const m2leaf = getNavigationItem(navItemMenuTwoLeafLevel._id);
  const m2sub = getNavigationItem(navItemMenuTwoSubLevel._id);
  const m2top = getNavigationItem(navItemMenuTwoTopLevel._id);
  const m3sub = getNavigationItem(navItemMenuThreeSubLevel._id);
  const m3top = getNavigationItem(navItemMenuThreeTopLevel._id);

  // Embed the Navigation item objects into the Navigation tree
  m3top.items = [m3sub];
  m2sub.items = [m2leaf];
  m2top.items = [m2sub];
  m1sub.items = [m1leaf];
  m1top.items = [m1sub];

  // Additional hardcoded setting
  m1top.expanded = true;
  m2top.expanded = true;
  m3top.expanded = true;

  // Creating top level items object
  const items = [m1top, m2top, m3top];

  // Create the tree
  const navigationTreeId = Random.id();
  await NavigationTrees.insertOne({
    _id: navigationTreeId,
    draftItems: items,
    hasUnpublishedChanges: true,
    items,
    name: DEFAULT_NAME,
    shopId
  });

  await context.mutations.publishNavigationChanges(context.getInternalContext(), {
    navigationTreeId,
    shopId
  });

  // Update the shop with new navigation tree
  await Shops.updateOne({ _id: shopId }, { $set: { defaultNavigationTreeId: navigationTreeId } });

  return true;
}
