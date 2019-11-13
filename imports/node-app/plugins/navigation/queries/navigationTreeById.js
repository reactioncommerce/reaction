import filterNavigationTreeItems from "../util/filterNavigationTreeItems.js";

/**
 * @name navigationTreeById
 * @method
 * @memberof Navigation/NoMeteorQueries
 * @summary Query for loading a navigation tree by _id
 * @param {Object} context An object containing the per-request state
 * @param {Object} args Params to find and filter the navigation tree by
 * @param {String} args.language Language to filter item content by
 * @param {String} args.navigationTreeId Navigation tree id
 * @param {Boolean} [args.shouldIncludeSecondary] Include secondary navigation items alongside primary items
 * @returns {Promise<MongoCursor>} A MongoDB cursor for the proper query
 */
export default async function navigationTreeById(context, { language, navigationTreeId, shouldIncludeSecondary = false } = {}) {
  const { collections, userHasPermission } = context;
  const { NavigationTrees } = collections;

  const navigationTree = await NavigationTrees.findOne({ _id: navigationTreeId });
  if (navigationTree) {
    // Add language from args so that we can use it in items & draftItems resolvers
    navigationTree.language = language;
    const shopId = await context.queries.primaryShopId(collections);

    const isAdmin = userHasPermission(["admin", "owner", "create-product"], shopId);

    // Filter items based on visibility options and user permissions
    navigationTree.items = filterNavigationTreeItems(navigationTree.items, {
      isAdmin,
      shouldIncludeSecondary
    });

    // Prevent non-admin users from getting draft items in results
    if (!isAdmin) {
      navigationTree.draftItems = null;
    }
  }

  return navigationTree;
}
