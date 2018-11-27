import { MongoInternals } from "meteor/mongo";
import { NoMeteorMedia } from "/imports/plugins/core/files/server";
import defineCollections from "/imports/node-app/core/util/defineCollections";

const collections = { Media: NoMeteorMedia };

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
defineCollections(db, collections);

export default collections;
