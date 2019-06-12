import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";
import { Security } from "meteor/ongoworks:security";
import fetch from "node-fetch";
import {
  MeteorFileCollection,
  RemoteUrlWorker,
  TempFileStoreWorker
} from "@reactioncommerce/file-collections";
import { MediaRecords } from "/lib/collections";

/**
 * Functions and objects related to file upload, download, and storage
 * @namespace Files
 */

/**
 * @param {Object} context App context
 * @return {undefined}
 */
export default function meteorFileCollectionStartup(context) {
  const { files } = context;
  if (!files) throw new Error("Expected context.files");

  const { stores, tempStore } = files;
  if (!stores) throw new Error("Expected context.files.stores");
  if (!tempStore) throw new Error("Expected context.files.tempStore");

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
   * @summary Start a worker to watch for finished uploads, store them permanently,
   * and then remove the temporary file
   * @see https://github.com/reactioncommerce/reaction-file-collections
   */
  const fileWorker = new TempFileStoreWorker({ fileCollections: [Media] });
  fileWorker.start();
}
