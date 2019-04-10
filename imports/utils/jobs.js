import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import createJobCollection from "@reactioncommerce/job-queue";

const later = Meteor.isServer && require("later");

const { Job, JobCollection } = createJobCollection({ Mongo, Meteor, check, Match, later });

const Jobs = new JobCollection("Jobs", {
  noCollectionSuffix: true
});

export { Jobs, Job };
