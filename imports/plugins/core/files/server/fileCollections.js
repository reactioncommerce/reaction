import { Meteor } from "meteor/meteor";
import { MongoInternals } from "meteor/mongo";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";
import { Security } from "meteor/ongoworks:security";
import fetch from "node-fetch";
import {
  FileDownloadManager,
  FileRecord,
  MeteorFileCollection,
  RemoteUrlWorker,
  TempFileStore,
  TempFileStoreWorker
} from "@reactioncommerce/file-collections";
import GridFSStore from "@reactioncommerce/file-collections-sa-gridfs";
import { Logger } from "/server/api";
import { MediaRecords } from "/lib/collections";

// lazy loading sharp package
let sharp;
async function lazyLoadSharp() {
  if (sharp) return;
  sharp = await import("sharp");
}

FileRecord.downloadEndpointPrefix = "/assets/files";
FileRecord.absoluteUrlPrefix = Meteor.absoluteUrl();

// 1024*1024*2 is the GridFSStore default chunk size, and 256k is default GridFS chunk size, but performs terribly
const gridFSStoresChunkSize = 1 * 1024 * 1024;
const mongodb = MongoInternals.NpmModules.mongodb.module;
const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

/**
 * @name imgTransforms
 * @constant {Array}
 * @property {string} name - transform name that will be used as GridFS name
 * @property {object|undefined} transform - object with image transform settings
 * @property {number} size - transform size, only one number needed for both width & height
 * @property {string} mod - transform modifier function call,
 * for example the `large` & `medium` image transforms want to preserve
 * the image's aspect ratio and resize based on the larger width or height
 * so we use the `max` Sharp modifier function.
 * Check out the {@link http://sharp.pixelplumbing.com/en/stable/|Sharp Docs} for more helper functions.
 * {@link http://sharp.pixelplumbing.com/en/stable/api-resize/#max|Sharp max()}
 * {@link http://sharp.pixelplumbing.com/en/stable/api-resize/#crop|Sharp crop()}
 * @property {string} format - output image format
 * @summary Defines all image transforms
 * Image files are resized to 4 different sizes:
 * 1. `large` - 1000px by 1000px - preserves aspect ratio
 * 2. `medium` - 600px by 600px - preserves aspect ratio
 * 3. `small` - 235px by 235px - crops to square - creates png version
 * 4. `thumbnail` - 100px by 100px - crops to square - creates png version
 */
const imgTransforms = [
  { name: "image", transform: { size: 1600, mod: "max", format: "jpg", type: "image/jpeg" } },
  { name: "large", transform: { size: 1000, mod: "max", format: "jpg", type: "image/jpeg" } },
  { name: "medium", transform: { size: 600, mod: "max", format: "jpg", type: "image/jpeg" } },
  { name: "small", transform: { size: 235, mod: "crop", format: "png", type: "image/png" } },
  { name: "thumbnail", transform: { size: 100, mod: "crop", format: "png", type: "image/png" } }
];

/**
 * @function buildGFS
 * @param {object} imgTransform
 * @summary buildGFS returns a fresh GridFSStore instance from provided image transform settings.
 */
const buildGFS = ({ name, transform }) => (
  new GridFSStore({
    chunkSize: gridFSStoresChunkSize,
    collectionPrefix: "cfs_gridfs.",
    db,
    mongodb,
    name,
    async transformWrite(fileRecord) {
      if (!transform) return;

      try {
        await lazyLoadSharp();
      } catch (error) {
        Logger.warn("Problem lazy loading Sharp lib in image transformWrite", error.message);
      }

      if (!sharp) {
        Logger.warn("In transformWrite, sharp does not seem to be available");
        return;
      }

      const { size, mod, format, type } = transform;
      // Need to update the content type and extension of the file info, too.
      // The new size gets set correctly automatically by FileCollections package.
      fileRecord.type(type, { store: name });
      fileRecord.extension(format, { store: name });

      // resizing image, adding mod, setting output format
      return sharp().resize(size, size)[mod]().toFormat(format);
    }
  })
);

/**
 * @name stores
 * @constant {Array}
 * @summary Defines an array of GridFSStore by mapping the imgTransform settings over the buildGFS function
 */
const stores = imgTransforms.map(buildGFS);

/**
 * @name tempStore
 * @type TempFileStore
 * @summary Defines the temporary store where chunked uploads from browsers go
 * initially, until the chunks are eventually combined into one complete file
 * which the worker will then store to the permanant stores.
 * @see https://github.com/reactioncommerce/reaction-file-collections
 */
const tempStore = new TempFileStore({
  shouldAllowRequest(req) {
    const { type } = req.uploadMetadata;
    if (typeof type !== "string" || !type.startsWith("image/")) {
      Logger.info(`shouldAllowRequest received request to upload file of type "${type}" and denied it`);
      return false;
    }
    return true;
  }
});
WebApp.connectHandlers.use("/assets/uploads", (req, res) => {
  req.baseUrl = "/assets/uploads"; // tus relies on this being set, which is an Express thing
  tempStore.connectHandler(req, res);
});

/**
 * @name Media
 * @type MeteorFileCollection
 * @summary Defines the Media FileCollection
 * To learn how to further manipulate images with Sharp, refer to
 * {@link http://sharp.pixelplumbing.com/en/stable/|Sharp Docs}
 * @see https://github.com/reactioncommerce/reaction-file-collections
 */
export const Media = new MeteorFileCollection("Media", {
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
 * @name downloadManager
 * @type FileDownloadManager
 * @summary Set up a URL for downloading the files
 * @see https://github.com/reactioncommerce/reaction-file-collections
 */
const downloadManager = new FileDownloadManager({
  collections: [Media],
  headers: {
    get: {
      "Cache-Control": "public, max-age=31536000"
    }
  }
});
WebApp.connectHandlers.use("/assets/files", downloadManager.connectHandler);

/**
 * @name remoteUrlWorker
 * @type RemoteUrlWorker
 * @summary Start a worker to watch for inserted remote URLs and stream them to all stores
 * @see https://github.com/reactioncommerce/reaction-file-collections
 */
const remoteUrlWorker = new RemoteUrlWorker({ fetch, fileCollections: [Media] });
remoteUrlWorker.start();

/**
 * @name fileWorker
 * @type TempFileStoreWorker
 * @summary Start a worker to watch for finished uploads, store them permanantly,
 * and then remove the temporary file
 * @see https://github.com/reactioncommerce/reaction-file-collections
 */
const fileWorker = new TempFileStoreWorker({ fileCollections: [Media] });
fileWorker.start();
