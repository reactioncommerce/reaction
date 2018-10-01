import { Meteor } from "meteor/meteor";
import { MeteorFileCollection } from "@reactioncommerce/file-collections";
import { JobFileRecords } from "../lib/collections";

export const JobFiles = new MeteorFileCollection("JobFiles", {
  // The backing Meteor Mongo collection, which you must make sure is published to clients as necessary
  collection: JobFileRecords,
  DDP: Meteor
});
