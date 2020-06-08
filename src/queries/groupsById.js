import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name groupsById
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary query the Groups collection and return a MongoDB cursor
 * @param {Object} context - an object containing the per-request state
 * @param {Array|String} groupIds - IDs of the groups to get
 * @returns {Array|Object} Group objects
 */
export default async function groupsById(context, groupIds) {
  const { collections } = context;
  const { Groups } = collections;

  const groups = await Groups.find({
    _id: {
      $in: groupIds
    }
  }).toArray();


  if (groups.length === 0) {
    throw new ReactionError("not-found", "No groups matching the provided IDs were found");
  }

  if (groups.length !== groupIds.length) {
    throw new ReactionError("not-found", `Could not find ${groupIds.length - groups.length} of ${groupIds.length} groups provided`);
  }

  await Promise.all(groups.map((group) => context.validatePermissions("reaction:legacy:groups", "read", { shopId: group.shopId })));

  return groups;
}
