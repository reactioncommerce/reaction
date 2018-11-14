import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name navigationTreeById
 * @method
 * @memberof Navigation/NoMeteorQueries
 * @summary Query for loading a navigation tree by _id
 * @param {Object} context An object containing the per-request state
 * @param {String} _id The _id of the navigation tree
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function navigationTreeById(context, _id) {
  const { collections } = context;
  const { NavigationTrees } = collections;

  return NavigationTrees.findOne({ _id });
}
