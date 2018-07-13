import { Meteor } from "meteor/meteor";
import { MongoInternals } from "meteor/mongo";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";
import { Security } from "meteor/ongoworks:security";
import fetch from "node-fetch";
import Logger from "@reactioncommerce/logger";
import {
  MeteorFileCollection,
  RemoteUrlWorker,
  TempFileStoreWorker
} from "@reactioncommerce/file-collections";
import { MediaRecords } from "/lib/collections";
import setUpFileCollections from "./no-meteor/setUpFileCollections";

/**
 * Functions and objects related to file upload, download, and storage
 * @namespace Files
 */

const mongodb = MongoInternals.NpmModules.mongodb.module;
const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const {
  downloadManager,
  Media: NoMeteorMedia,
  stores,
  tempStore
} = setUpFileCollections({
  absoluteUrlPrefix: Meteor.absoluteUrl(),
  db,
  Logger,
  MediaRecords: MediaRecords.rawCollection(),
  mongodb
});

WebApp.connectHandlers.use("/assets/uploads", (req, res) => {
  req.baseUrl = "/assets/uploads"; // tus relies on this being set, which is an Express thing
  tempStore.connectHandler(req, res);
});

/**
 * @name Media
 * @type MeteorFileCollection
 * @memberof Files
 * @summary Defines the Media FileCollection
 *   To learn how to further manipulate images with Sharp, refer to
 *   {@link http://sharp.pixelplumbing.com/en/stable/|Sharp Docs}
 * @see {@link https://github.com/reactioncommerce/reaction-file-collections}
 */
const Media = new MeteorFileCollection("Media", {
  allowInsert: (userId, doc) => Security.can(userId).insert(doc).for(MediaRecords).check(),
  allowUpdate: (userId, id, modifier) => Security.can(userId).update(id, modifier).for(MediaRecords).check(),
  allowRemove: (userId, id) => Security.can(userId).remove(id).for(MediaRecords).check(),
  check,
  collection: MediaRecords,
  DDP: Meteor,
  allowGet: () => true, // add more security here if the files should not be public
  stores,
  tempStore
});

// For backward-compatibility with code relying on how CFS did it, we'll put a
// reference to the backing MongoDB collection on Media.files property as well.
Media.files = MediaRecords;

WebApp.connectHandlers.use("/assets/files", downloadManager.connectHandler);

/**
 * @name remoteUrlWorker
 * @type RemoteUrlWorker
 * @memberof Files
 * @summary Start a worker to watch for inserted remote URLs and stream them to all stores
 * @see https://github.com/reactioncommerce/reaction-file-collections
 */
const remoteUrlWorker = new RemoteUrlWorker({ fetch, fileCollections: [Media] });
remoteUrlWorker.start();

/**
 * @name fileWorker
 * @type TempFileStoreWorker
 * @memberof Files
 * @summary Start a worker to watch for finished uploads, store them permanantly,
 * and then remove the temporary file
 * @see https://github.com/reactioncommerce/reaction-file-collections
 */
const fileWorker = new TempFileStoreWorker({ fileCollections: [Media] });
fileWorker.start();

export {
  Media,
  NoMeteorMedia
};
