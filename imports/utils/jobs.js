import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo, MongoInternals } from "meteor/mongo";
import createJobCollection from "@reactioncommerce/job-queue";
import Logger from "@reactioncommerce/logger";
import appEvents from "/imports/node-app/core/util/appEvents";
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

  Meteor.startup(() => {
    // start job server
    Jobs.startJobServer(() => {
      Logger.info("JobServer started");
      appEvents.emit("jobServerStart");
    });
    if (process.env.VERBOSE_JOBS) {
      Jobs.setLogStream(process.stdout);
    }
  });
}

export { Jobs, Job };
