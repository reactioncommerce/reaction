import Random from "@reactioncommerce/random";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { MongoInternals } from "meteor/mongo";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";
import fetch from "node-fetch";
import {
  FileDownloadManager,
  RemoteUrlWorker,
  MeteorFileCollection,
  MongoFileCollection,
  TempFileStore,
  TempFileStoreWorker
} from "@reactioncommerce/file-collections";
import GridFSStore from "@reactioncommerce/file-collections-sa-gridfs";
import { JobFileRecords } from "../lib/collections";

const chunkSize = 1 * 1024 * 1024;
const mongodb = MongoInternals.NpmModules.mongodb.module;
const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const stores = [
  new GridFSStore({
    chunkSize,
    db,
    mongodb,
    name: "jobFiles"
  })
];

const tempStore = new TempFileStore({
  shouldAllowRequest(req) {
    const { type } = req.uploadMetadata;
    if (typeof type !== "string" || !type.startsWith("text/csv")) {
      Logger.info(`shouldAllowRequest received request to upload file of type "${type}" and denied it`); // eslint-disable-line no-console
      return false;
    }
    return true;
  }
});

const JobFiles = new MeteorFileCollection("JobFiles", {
  // add more security depending on who should be able to manipulate the file records
  allowInsert: () => true,
  allowUpdate: () => true,
  allowRemove: () => true,
  // add more security here if the files should not be public
  allowGet: () => true,
  check,
  collection: JobFileRecords,
  DDP: Meteor,
  stores,
  tempStore
});

const NoMeteorJobFiles = new MongoFileCollection("JobFiles", {
  // add more security here if the files should not be public
  allowGet: () => true,
  collection: JobFileRecords.rawCollection(),
  makeNewStringID: () => Random.id(),
  stores,
  tempStore
});

const downloadManager = new FileDownloadManager({
  collections: [JobFiles],
  headers: {
    get: {
      "Cache-Control": "public, max-age=31536000"
    }
  }
});

WebApp.connectHandlers.use("/jobs/errorFiles", downloadManager.connectHandler);

const remoteUrlWorker = new RemoteUrlWorker({ fetch, fileCollections: [JobFiles] });
remoteUrlWorker.start();

const uploadWorker = new TempFileStoreWorker({ fileCollections: [JobFiles] });

uploadWorker.start();

WebApp.connectHandlers.use("/jobs/uploads", (req, res) => {
  req.baseUrl = "/jobs/uploads"; // tus relies on this being set
  tempStore.connectHandler(req, res);
});

export {
  NoMeteorJobFiles,
  JobFiles
};
