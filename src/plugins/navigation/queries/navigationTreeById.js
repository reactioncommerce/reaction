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
 * @param {String} args.shopId Shop ID Navigation tree belongs to
 * @param {Boolean} [args.shouldIncludeSecondary] Include secondary navigation items alongside primary items
 * @returns {Promise<MongoCursor>} A MongoDB cursor for the proper query
 */
export default async function navigationTreeById(context, { language, navigationTreeId, shopId, shouldIncludeSecondary = false } = {}) {
  const { collections } = context;
  const { NavigationTrees } = collections;

  const navigationTree = await NavigationTrees.findOne({ _id: navigationTreeId, shopId });
  if (navigationTree) {
    // Add language from args so that we can use it in items & draftItems resolvers
    navigationTree.language = language;

    // Check to make sure user has `read` permissions for this navigationTree
    await context.validatePermissions(`reaction:navigationTrees:${navigationTreeId}`, "read", { shopId, legacyRoles: ["owner", "admin", "create-product"] });

    // Check to see if user has `read` permissions for this navigationTree's drafts
    // TODO(pod-auth): revisit using `drafts` in resource
    const hasDraftPermissions = await context.userHasPermission(
      `reaction:navigationTrees:${navigationTreeId}:drafts`,
      "read",
      { shopId, legacyRoles: ["owner", "admin", "create-product"] }
    );

    // Filter items based on visibility options and user permissions
    navigationTree.items = filterNavigationTreeItems(navigationTree.items, {
      isAdmin: hasDraftPermissions,
      shouldIncludeSecondary
    });

    // Prevent non-admin users from getting draft items in results
    if (!hasDraftPermissions) {
      navigationTree.draftItems = null;
    }
  }

  return navigationTree;
}
