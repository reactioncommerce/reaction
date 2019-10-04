/**
 * @deprecated
 * Importing from this file is deprecated. This will be removed in the next major
 * release. Use the new non-Meteor way of managing background jobs and workers.
 */
import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import createJobCollection from "@reactioncommerce/job-queue";

const later = Meteor.isServer && require("later");

const { Job, JobCollection } = createJobCollection({ Mongo, Meteor, check, Match, later });

const Jobs = new JobCollection("Jobs", {
  noCollectionSuffix: true
});

// Add an index to support the `status: "running"` lookups it does
if (Meteor.isServer) {
  Meteor.startup(() => {
    // start job server
    Jobs.startJobServer();
    if (process.env.VERBOSE_JOBS) {
      Jobs.setLogStream(process.stdout);
    }
  });
}

export { Jobs, Job };
