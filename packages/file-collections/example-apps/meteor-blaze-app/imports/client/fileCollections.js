/* eslint-disable node/no-missing-import */
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { FileRecord, MeteorFileCollection } from "@reactioncommerce/file-collections";

// These need to be set in only one client-side file
FileRecord.absoluteUrlPrefix = "http://localhost:3000";
FileRecord.downloadEndpointPrefix = "/files/";
FileRecord.uploadEndpoint = "/juicy/uploads/";

export const Images = new MeteorFileCollection("Images", {
  // The backing Meteor Mongo collection, which you must make sure is published to clients as necessary
  collection: new Mongo.Collection("ImagesFileCollection"),
  DDP: Meteor
});
