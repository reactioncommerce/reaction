/* eslint-disable node/no-missing-import */
import { Meteor } from "meteor/meteor";
import { Mongo, MongoInternals } from "meteor/mongo";
import { Random } from "meteor/random";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";
import fetch from "node-fetch";
import {
  FileDownloadManager,
  FileRecord,
  RemoteUrlWorker,
  MongoFileCollection,
  TempFileStore,
  TempFileStoreWorker
} from "@reactioncommerce/file-collections";
import GridFSStore from "@reactioncommerce/file-collections-sa-gridfs";

// handle any unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION", err); // eslint-disable-line no-console
});

// lazy loading sharp package
let sharp;

/**
 * @returns {void} null
 */
async function lazyLoadSharp() {
  if (sharp) return;
  const mod = await import("sharp");
  sharp = mod.default;
}

const chunkSize = 1 * 1024 * 1024;
const mongodb = MongoInternals.NpmModules.mongodb.module;
const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const stores = [
  new GridFSStore({
    chunkSize,
    db,
    mongodb,
    name: "images",
    async transformWrite(fileRecord) {
      await lazyLoadSharp();

      // Need to update the content type and extension of the file info, too.
      // The new size gets set correctly automatically.
      fileRecord.type("image/jpeg", { store: "images" });
      fileRecord.extension("jpg", { store: "images" });

      // Resize keeping aspect ratio so that largest side is max 1600px, and convert to JPEG if necessary
      return sharp().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).toFormat("jpeg");
    }
  }),

  new GridFSStore({
    chunkSize,
    db,
    mongodb,
    name: "thumbs",
    async transformWrite(fileRecord) {
      await lazyLoadSharp();

      // Need to update the content type and extension of the file info, too.
      // The new size gets set correctly automatically.
      fileRecord.type("image/png", { store: "thumbs" });
      fileRecord.extension("png", { store: "thumbs" });

      // Resize to 100x100 square, cropping to fit, and convert to PNG if necessary
      return sharp().resize(100, 100, { fit: "cover" }).toFormat("png");
    }
  })
];

const tempStore = new TempFileStore({
  shouldAllowRequest(req) {
    const { type } = req.uploadMetadata;
    if (typeof type !== "string" || !type.startsWith("image/")) {
      console.info(`shouldAllowRequest received request to upload file of type "${type}" and denied it`); // eslint-disable-line no-console
      return false;
    }
    return true;
  }
});

const ImagesCollection = new Mongo.Collection("ImagesFileCollection");

const Images = new MongoFileCollection("Images", {
  // add more security here if the files should not be public
  allowGet: () => true,
  collection: ImagesCollection.rawCollection(),
  makeNewStringID: () => Random.id(),
  stores,
  tempStore
});

Meteor.methods({
  async insertRemoteImage(url) {
    check(url, String);
    const fileRecord = await FileRecord.fromUrl(url, { fetch });
    return Images.insert(fileRecord, { raw: true });
  },
  async insertUploadedImage(fileRecordDocument) {
    check(fileRecordDocument, Object);
    return Images._insert(fileRecordDocument);
  },
  async removeImage(id) {
    const fileRecord = await Images.findOne(id);
    if (!fileRecord) throw new Meteor.Error("not-found", `No FileRecord has ID ${id}`);
    const result = await Images.remove(fileRecord);
    return result;
  },
  async removeAllImages() {
    const images = await Images.find();
    const result = await Promise.all(images.map((fileRecord) => Images.remove(fileRecord)));
    return result;
  },
  async cloneImage(id) {
    const fileRecord = await Images.findOne(id);
    if (!fileRecord) throw new Meteor.Error("not-found", `No FileRecord has ID ${id}`);

    // The side effect of this call should be that a new file record now
    // exists with data in both stores, and will be autopublished to the client.
    await fileRecord.fullClone();
  }
});

const downloadManager = new FileDownloadManager({
  collections: [Images],
  headers: {
    get: {
      "Cache-Control": "public, max-age=31536000"
    }
  }
});

const remoteUrlWorker = new RemoteUrlWorker({ fetch, fileCollections: [Images] });
remoteUrlWorker.start();

const uploadWorker = new TempFileStoreWorker({ fileCollections: [Images] });
uploadWorker.start();

WebApp.connectHandlers.use("/juicy/uploads", (req, res) => {
  req.baseUrl = "/juicy/uploads"; // tus relies on this being set
  tempStore.connectHandler(req, res);
});

WebApp.connectHandlers.use("/files", downloadManager.connectHandler);
