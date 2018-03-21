import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { MeteorFileCollection, FileRecord } from "@reactioncommerce/file-collections";
import { MediaRecords } from "/lib/collections";

FileRecord.downloadEndpointPrefix = "/assets/files";
FileRecord.uploadEndpoint = "/assets/uploads";
FileRecord.absoluteUrlPrefix = Reaction.absoluteUrl();

export const Media = new MeteorFileCollection("Media", {
  // The backing Meteor Mongo collection, which you must make sure is published to clients as necessary
  collection: MediaRecords,
  DDP: Meteor
});
