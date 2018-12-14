/**
 * @name navigationTreeById
 * @method
 * @memberof Navigation/NoMeteorQueries
 * @summary Query for loading a navigation tree by _id
 * @param {Object} context An object containing the per-request state
 * @param {String} language Language to filter item content by
 * @param {String} _id The _id of the navigation tree
 * @return {Promise<MongoCursor>} A MongoDB cursor for the proper query
 */
export default async function navigationTreeById(context, language, _id) {
  const { collections } = context;
  const { NavigationTrees } = collections;

  const navigationTree = await NavigationTrees.findOne({ _id });
  if (navigationTree) {
    // Add language from args so that we can use it in items & draftItems resolvers
    navigationTree.language = language;
  }

  return navigationTree;
}
