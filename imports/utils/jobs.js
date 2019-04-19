import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo, MongoInternals } from "meteor/mongo";
import createJobCollection from "@reactioncommerce/job-queue";
import collectionIndex from "./collectionIndex";

const later = Meteor.isServer && require("later");

const { Job, JobCollection } = createJobCollection({ Mongo, Meteor, check, Match, later });

const Jobs = new JobCollection("Jobs", {
  noCollectionSuffix: true
});

// Add an index to support the `status: "running"` lookups it does
if (Meteor.isServer) {
  const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;
  collectionIndex(db.collection("Jobs"), { status: 1 });
}

export { Jobs, Job };
