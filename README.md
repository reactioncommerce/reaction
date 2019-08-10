# reaction-file-collections

Reaction FileCollections is a set of NPM packages that provide the ability to support file uploads, storage, and downloads in Node and Meteor apps, and in browser JavaScript. It is based on the no-longer-supported [Meteor-CollectionFS](https://github.com/CollectionFS/Meteor-CollectionFS) project patterns, but greatly simplified and modernized.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation](#installation)
- [Server Setup](#server-setup)
  - [Create Stores](#create-stores)
    - [GridFSStore](#gridfsstore)
  - [Create TempFileStore and Enable File Uploads](#create-tempfilestore-and-enable-file-uploads)
  - [Create FileCollection](#create-filecollection)
    - [MongoFileCollection](#mongofilecollection)
    - [MeteorFileCollection](#meteorfilecollection)
  - [Enable File Downloads](#enable-file-downloads)
  - [Set Up a File Worker](#set-up-a-file-worker)
- [Browser Setup](#browser-setup)
- [Upload a File Chosen By User](#upload-a-file-chosen-by-user)
- [Store a File From a Remote URL](#store-a-file-from-a-remote-url)
- [Making Your Own Storage Adapter](#making-your-own-storage-adapter)
- [Debugging](#debugging)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Your app should depend on the `@reactioncommerce/file-collections` package:

```bash
npm i --save @reactioncommerce/file-collections
```

And then depend on a storage adapter package. Currently there is only GridFS:

```bash
npm i --save @reactioncommerce/file-collections-sa-gridfs
```

## Server Setup

The overall steps are:

1. Create one or more stores where files will be saved. You can choose a storage adapter that works for you.
1. Create an instance of TempFileStore, which defines where multi-part browser uploads will be stored temporarily while the upload is in progress. You can create multiple, but usually one is enough even if you have multiple FileCollections and/or multiple stores.
1. Create one or more FileCollection (or MeteorFileCollection) instances, where information about files will be stored. The backing store for these is MongoDB ( >= 3.6 due to the usage of Change Streams ), and each document is known as a FileRecord. You must link one or more of the stores created in the previous step with your FileCollection.
1. Create a FileDownloadManager instance, which you will use to register an HTTP endpoint for file downloads. Usually one is enough, even if you have multiple FileCollections and/or multiple stores, but you could create multiple if you need different response headers for different FileCollections.
1. Create and start a RemoteUrlWorker instance, which triggers final storage streaming from a remote URL, after you've inserted a FileRecord that you created using `FileRecord.fromUrl`.
1. Create and start a TempFileStoreWorker instance, which triggers final storage after an upload from a browser is complete.
1. Register endpoints for upload and download.

What follows is more detail for each of these steps. Check out [server/main.js in the example Meteor app](example-apps/meteor-blaze-app/server/main.js) to see it all put together.

### Create Stores

A store is where files are ultimately saved and retrieved from. In a simple scenario, you might have one store per FileCollection. Often, though, you need to process files and store multiple related copies. In this case, each copy goes into its own store, and the FileCollection record (the FileRecord) ties them all together. For example, you might transform all image uploads and save them to four different stores: large, med, small, thumbnail.

A store is created by making a new instance of a storage adapter class. For example, `new GrisFSStore({ name: "primary" })` creates a new store backed by MongoDB GridFS and named "primary".

You can mix and match storage adapters within the set of stores that you attach to a FileCollection. For example, you could store each file duplicated in GridFS and an S3 bucket. Or you could store image thumbnails in GridFS but store the full original image in an S3 bucket.

Each storage adapter package has its own constructor options unique to that package, but a few options are common to all storage adapters:

- `name`: REQUIRED. Any name you want to use to identify the store. Keep in mind this appears in the URL for downloads from that store.
- `fileKeyMaker`: OPTIONAL. You should rarely need to use this. Provide a function that takes a FileRecord instance and returns an identifying key for saving a new copy of a file. This will override the storage adapter's default key-creation logic.
- `transformWrite`: OPTIONAL. This is where you can transform a file stream before saving. You will receive the FileRecord instance as the only argument, and you must return a ReadWrite stream that performs a transformation. Can optionally return a Promise.
- `transformRead`: OPTIONAL. This is where you can transform a file stream being read out of the store. You will receive the FileRecord instance as the only argument, and you must return a ReadWrite stream that performs a transformation. Can optionally return a Promise.

#### GridFSStore

In addition to the common options, `GridFSStore` requires that you pass in two dependencies: `db`, your MongoDB client, and `mongodb`, which is the default export from the [mongodb NPM package](https://www.npmjs.com/package/mongodb).

Here is an example GridFS store that resizes an uploaded image if it's above a certain size, and converts it to JPEG format if it isn't already JPEG. It uses the [sharp NPM package](https://www.npmjs.com/package/sharp) for transformation.

```js
import GridFSStore from "@reactioncommerce/file-collections-sa-gridfs";
import mongodb from "mongodb";
import sharp from "sharp";

const db = getDBSomehow(); // get your mongodb client from where you have it

// Or, if in a Meteor app, get db and mongodb this way:
const mongodb = MongoInternals.NpmModules.mongodb.module;
const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const imagesStore = new GridFSStore({
  chunkSize: 1 * 1024 * 1024, // You don't have to customize this, but you can
  db,
  mongodb,
  name: "images",
  transformWrite(fileRecord) {
    // Need to update the content type and extension of the file info, too.
    // The new size gets set correctly automatically.
    fileRecord.type("image/jpeg", { store: "images" });
    fileRecord.extension("jpg", { store: "images" });

    // Resize keeping aspect ratio so that largest side is max 1600px, and convert to JPEG if necessary
    return sharp().resize(1600, 1600).max().toFormat("jpg");
  }
}),
```

### Create TempFileStore and Enable File Uploads

A `TempFileStore` instance defines where multi-part browser uploads will be stored temporarily while the upload is in progress. You can create multiple, but usually one is enough even if you have multiple FileCollections and/or multiple stores.

Example:

```js
import { TempFileStore } from "@reactioncommerce/file-collections";

const tempStore = new TempFileStore({
  // Optional. 20MB is the default
  maxFileSize: 1024 * 1024 * 2,

  // Optional. "uploads" is default. This is the OS file path relative to the
  // Node app's directory. It will be created if possible. Files are only stored
  // here temporarily during uploading from a browser.
  osFilePath: "my_upload_folder",

  // Required. Without this, all requests will receive Forbidden response.
  // Simply returning `true` will allow anyone to upload anything.
  // This is an example of checking the file type, which is available to you in
  // a req.uploadMetadata object (as is size). You could also examine the request
  // headers for an authorization token.
  shouldAllowRequest(req) {
    const { type } = req.uploadMetadata;
    if (typeof type !== "string" || !type.startsWith("image/")) {
      console.info(`shouldAllowRequest received request to upload file of type "${type}" and denied it`); // eslint-disable-line no-console
      return false;
    }
    return true;
  }
});
```

Then define a route for it using Express/Connect. In a Meteor app:

```js
import { WebApp } from "meteor/webapp";

WebApp.connectHandlers.use("/uploads", tempStore.connectHandler);
```

Uploads are handled by the [tus](https://tus.io/) library.

### Create FileCollection

A FileCollection is where original files are tracked and mapped to their copies that exist in one or more stores. Most `FileCollection` methods accept and/or return `FileRecord` instances. A `FileRecord` is one document within a `FileCollection`, representing one original file, but potentially multiple copies of it in your linked stores.

The `FileCollection` class itself is generic and must be subclassed to define where the file document is actually stored. There are currently two included subclasses: `MeteorFileCollection` and `MongoFileCollection`.

#### MongoFileCollection

A `MongoFileCollection` is a FileCollection that stores the documents in MongoDB.

Here's an example:

```js
import { MongoClient } from "mongodb";
import { MongoFileCollection } from "@reactioncommerce/file-collections";
import getRandomId from "./getRandomId";

const { DATABASE_NAME, DATABASE_URL } = process.env;

MongoClient.connect(DATABASE_URL, (error, client) => {
  if (error) throw error;
  console.info("Connected to MongoDB");
  db = client.db(DATABASE_NAME);

  const Images = new MongoFileCollection("Images", {
    // Just a normal Mongo `Collection` instance. Name it however you like.
    collection: db.collection("ImagesFileCollection"),

    // add more security here if the files should not be public
    allowGet: () => true,

    makeNewStringID: () => getRandomId(),

    // See previous sections in the documentation for the definitions of imagesStore and tempStore
    stores: [imagesStore],
    tempStore
  });

  // Do something with Images
});
```

#### MeteorFileCollection

A `MeteorFileCollection` is a FileCollection that stores the documents in MongoDB using Meteor's `Mongo.Collection` API. While you could just use `MongoFileCollection` in a Meteor app, `MeteorFileCollection` will set up DDP methods and security automatically, and exports a client API that uses them. This means you can insert, update, and remove file records from browser code. You will also get the built-in Tracker reactivity when you `find` in browser code.

Here's an example:

```js
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { MeteorFileCollection } from "@reactioncommerce/file-collections";

const Images = new MeteorFileCollection("Images", {
  // Optional, but you should pass it in if you use the audit-argument-checks Meteor package
  check,

  // Just a normal Meteor `Mongo.Collection` instance. Name it however you like.
  collection: new Mongo.Collection("ImagesFileCollection"),

  // Usually you'll pass `Meteor` as the `DDP` option, but you could also
  // pass a different DDP connection. Methods will be set up on this connection
  // for browser instances of MeteorFileCollection to call.
  DDP: Meteor,

  // add more security depending on who should be able to manipulate the file records
  allowInsert: () => true,
  allowUpdate: () => true,
  allowRemove: () => true,

  // add more security here if the files should not be public
  allowGet: () => true,

  // See previous sections in the documentation for the definitions of imagesStore and tempStore
  stores: [imagesStore],
  tempStore
});
```

### Enable File Downloads

This is straightforward. Pass in an array of all FileCollection instances that should be served by a single endpoint. You can optionally pass headers to set on all responses.

```js
import { FileDownloadManager } from "@reactioncommerce/file-collections";

const downloadManager = new FileDownloadManager({
  collections: [Images],
  headers: {
    get: {
      "Cache-Control": "public, max-age=31536000"
    }
  }
});
```

Then define a route for it using Express/Connect. In a Meteor app:

```js
import { WebApp } from "meteor/webapp";

WebApp.connectHandlers.use("/files", downloadManager.connectHandler);
```

This means that all files in the Images file collection will have URLs that begin with `/files`. The full URL will be `/files/:collectionName/:fileId/:storeName/:filename`.

### Set Up a Worker for Browser Uploads

A `TempFileStoreWorker` instance observes one or more MongoFileCollections and triggers final storage after an upload from a browser is complete and all the chunks have been assembled into a single file in the temp store.

All provided FileCollections should be `MongoFileCollections` and need to use MongoDB version 3.6 or higher because Change Streams are used to watch for new files. Passing `MeteorFileCollections` is also supported for backward compatibility.

Example:

```js
import { TempFileStoreWorker } from "@reactioncommerce/file-collections";

const worker = new TempFileStoreWorker({ fileCollections: [Images] });
worker.start();
```

Keep in mind that a worker can run in a separate service from your main app, and you may wish to do it this way for scalability. However, there is not yet support for running multiple workers. (They will all try to work the same file record.) This could be solved easily enough if you are interested in submitting a pull request to add record locking.

Also, a `TempFileStoreWorker` must be running on the same machine (or container) where the related TempFileStore is running.

### Set Up a Worker for Streaming Remote URLs to Storage

A `RemoteUrlWorker` instance observes one or more MongoFileCollections and triggers final storage streaming from a remote URL, after you've inserted a FileRecord that you created using `FileRecord.fromUrl`. You'll need to pass in a reference to a `fetch` implementation.

All provided FileCollections should be `MongoFileCollections` and need to use MongoDB version 3.6 or higher because Change Streams are used to watch for new files. Passing `MeteorFileCollections` is also supported for backward compatibility.

Example:

```js
import fetch from "node-fetch";
import { RemoteUrlWorker } from "@reactioncommerce/file-collections";

const worker = new RemoteUrlWorker({ fetch, fileCollections: [Images] });
worker.start();
```

Keep in mind that a worker can run in a separate service from your main app, and you may wish to do it this way for scalability. However, there is not yet support for running multiple workers. (They will all try to work the same file record.) This could be solved easily enough if you are interested in submitting a pull request to add record locking.

## Browser Setup

There is much less setup necessary in browser code. First define the same FileCollection that you defined in server code:

```js
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { MeteorFileCollection } from "@reactioncommerce/file-collections";

const Images = new MeteorFileCollection("Images", {
  // The backing Meteor Mongo collection, which you must make sure is published to clients as necessary
  collection: new Mongo.Collection("ImagesFileCollection"),

  // Usually you'll pass `Meteor` as the `DDP` option, but you could also
  // pass a different DDP connection. Methods will be called on this connection
  // if you perform inserts, updates, or removes in browser code
  DDP: Meteor
});
```

Then set the default upload and download URLs:

```js
import { FileRecord } from "@reactioncommerce/file-collections";

// These need to be set in only one client-side file
FileRecord.absoluteUrlPrefix = "https://my.app.com";
FileRecord.downloadEndpointPrefix = "/files";
FileRecord.uploadEndpoint = "/uploads";
```

These must match the Express/Connect routes you defined on the server. Set these just once, early in your browser code, before you call `fileRecord.upload()` or `fileRecord.url()` anywhere.

## Upload a File Chosen By User

All the setup is done. Time for the easy part. Let the user pick a file, upload it, and then save the file record.

```js
function uploadAndInsertBrowserFile(file) {
  // Convert it to a FileRecord
  const fileRecord = FileRecord.fromFile(file);

  // Listen for upload progress events if desired
  fileRecord.on("uploadProgress", (info) => {
    console.info(info);
  });

  // Do the upload. chunkSize is optional and defaults to 5MB
  fileRecord.upload({ chunkSize: 1024 * 1024 })
    .then((id) => {
      console.log(`Temp ID is ${id}`);

      // We insert only AFTER the server has confirmed that all chunks were uploaded
      return Images.insert(fileRecord);
    })
    .then(() => {
      console.log("FileRecord saved to database");
    })
    .catch((error) => {
      console.error(error);
    });
}

// Example event handler for a type=file HTML input
function handler(event) {
  const [file] = event.target.files;
  uploadAndInsertBrowserFile(file);
}
```

Uploading from Node should also work (for example a Blob), but this hasn't been tested. There is a `FileRecord.fromBlob` static method.

## Store a File From a Remote URL

Either in a browser or in Node code, you can also store and insert a file record from a remote URL.

Make sure you have a file worker set up somewhere to do the actual download, transformation, and storage.

```js
import fetch from "node-fetch";
import { FileRecord } from "@reactioncommerce/file-collections";
import Images from "./Images"; // wherever you defined your FileCollection

async function insertRemoteFile(url) {
  const fileRecord = await FileRecord.fromUrl(url, { fetch });
  return Images.insert(fileRecord);
}
```

## Making Your Own Storage Adapter

Each storage adapter should be its own NPM package. If you create one, you can submit a pull request to add it in the `packages` folder of this repo, or you can store it in your own repo and publish it yourself.

To make a storage adapter package:

- Depend on the `@reactioncommerce/file-collections-sa-base` package.
- Import and extend `StorageAdapter` from that package.
- Be sure to pass the following constructor options to `super`: `fileKeyMaker`, `name`, `transformRead`, `transformWrite`
- Define the following methods on your class: `_fileKeyMaker`, `_getReadStream`, `_getWriteStream`, `_removeFile`
- Set `this.typeName` to a string that identifies your type of storage adapter. This will be the `storageAdapter` property on each copy in a FileRecord, which is currently just informational.
- Export your class as the default package export.

Refer to the `GridFSStore` class definition as a model.

## Debugging

When dealing with streams, trying to debug with `inspect` and breakpoints isn't always possible. All of the file-collections packages log plenty of information for debugging in the `reaction-file-collections` namespace. Run your Node or Meteor app with `DEBUG=reaction-file-collections` or `DEBUG=reaction*` to see it.

## Releases

This NPM package is published automatically on every push to the `master` branch. Be sure to use proper Git commit messages so that the version will be bumped properly and release notes can be automatically generated.

- Refer to https://github.com/semantic-release/semantic-release#commit-message-format
- Do not update the CHANGELOG.md files. They are generated automatically.
- To avoid triggering a release, such as for a README-only change, include `[skip release]` in your commit message.

## Working In This Repo

### Run the Example Meteor Blaze App

Install [Meteor](https://www.meteor.com/), and then run the following commands:

```bash
npm install
npm run bootstrap
cd example-apps/meteor-blaze-app
meteor npm install
npm start
```

#### Make Changes to the Packages While Running Example App

1. Change some files.
2. Run `npm run bootstrap` in project root.
3. Meteor app will automatically restart and pull in your package changes.

### Run Tests

```bash
npm install
npm run bootstrap
npm test
```

### Publish

Lerna is used to publish these packages and will determine appropriate version bumps automatically. To do these steps, you must have permission to push to this GitHub repo AND permission to publish all the NPM packages.

In the repo root directory, with `master` branch checked out:

```
npx lerna publish --conventional-commits
```

Confirm the proposed package publications. Enter Y.

If you have 2FA set up for your NPM account (you should), enter the OTP (one-time password) when prompted.

Verify on https://www.npmjs.com/package/@reactioncommerce that new versions of changed packages were published. You should also see a release/tag pushed to GitHub [here](https://github.com/reactioncommerce/reaction-file-collections/releases).
