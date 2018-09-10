import { MongoInternals } from "meteor/mongo";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

export const JobItems = db.collection("JobItems");
