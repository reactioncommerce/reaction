import buildContext from "./buildContext";
import collections from "/imports/collections/rawCollections";
import methods from "./methods";
import mutations from "./mutations";
import queries from "./queries";

export const baseContext = {
  collections,
  methods,
  mutations,
  queries
};

/**
 * @method buildMeteorContext
 * @summary Calls buildContext to build a GraphQL context object, after first looking up
 *   the user by userId in collections.users.
 * @param {String} userId - The user ID for the current request
 * @return {Object}
 */
export default async function buildMeteorContext(userId) {
  const user = await collections.users.findOne({ _id: userId });
  const meteorContext = { ...baseContext };
  await buildContext(meteorContext, user);
  return meteorContext;
}
