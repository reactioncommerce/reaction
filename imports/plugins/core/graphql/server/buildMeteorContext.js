import { MongoInternals } from "meteor/mongo";
import { NoMeteorMedia } from "/imports/plugins/core/files/server";
import buildContext from "./buildContext";
import defineCollections from "./defineCollections";
import methods from "./methods";
import mutations from "./muitations";
import queries from "./queries";

const collections = { Media: NoMeteorMedia };

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
defineCollections(db, collections);

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
