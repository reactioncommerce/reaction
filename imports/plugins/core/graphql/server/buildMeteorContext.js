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
 * TODO:
 * @method buildMeteorContext
 * @summary
 * @param {string} userId - TODO:
 * @return {Object}
 */
export default async function buildMeteorContext(userId) {
  const user = await collections.users.findOne({ _id: userId });
  const meteorContext = { ...baseContext };
  buildContext(meteorContext, user);
  return meteorContext;
}
