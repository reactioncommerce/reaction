import { Meteor } from "meteor/meteor";

/**
 * @name tags
 * @method
 * @summary query the Tags collection by shop ID and optionally by isTopLevel
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of shop to query
 * @param {Boolean} [isTopLevel] - If set, look for `isTopLevel` matching this value
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function tags(context, shopId, { includeDeleted = false, isTopLevel } = {}) {
  const { collections, userHasPermission } = context;

  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new Meteor.Error("access-denied", "User does not have permissions to view tags");
  }

  const { Tags } = collections;
  const query = { shopId };

  if (isTopLevel === false || isTopLevel === true) query.isTopLevel = isTopLevel;
  if (includeDeleted !== true) query.isDeleted = false;

  return Tags.find(query);
}
