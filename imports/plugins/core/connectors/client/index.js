import { Meteor } from "meteor/meteor";
import { MeteorFileCollection } from "@reactioncommerce/file-collections";
import { ImportFileRecords } from "../lib/collections";
import "./templates/dashboard";

export const ImportFiles = new MeteorFileCollection("ImportFiles", {
  // The backing Meteor Mongo collection, which you must make sure is published to clients as necessary
  collection: ImportFileRecords,
  DDP: Meteor
});
