import { EventEmitter } from "events";
import FileRecord from "../common/FileRecord";
import debug from "./debug";

/**
 * From https://stackoverflow.com/a/41791149/1669674
 *
 * @param {Array} items An array of items.
 * @param {Function} fn A function that accepts an item from the array and returns a promise.
 * @returns {Promise} reduce promise
 */
function forEachPromise(items, fn) {
  return items.reduce(
    (promise, item) => promise
      .then(() => fn(item))
      .catch((error) => { throw error; }),
    Promise.resolve()
  );
}

export default class TempFileStoreWorker extends EventEmitter {
  constructor({ fileCollections = [], onNewFileRecord } = {}) {
    super();

    this.fileCollections = fileCollections;
    this.observeHandles = [];
    this.onNewFileRecord = onNewFileRecord;
  }

  pushObservedDocument(doc, collection, stores, tempStore) {
    const { onNewFileRecord } = this;
    if (onNewFileRecord) {
      onNewFileRecord(doc, collection);
    } else {
      debug("No onNewFileRecord function passed to TempFileStoreWorker, using internal function");
      this.handleTempStoreIdAdded({ collection, doc, stores, tempStore })
        .catch((error) => {
          console.error(error); // eslint-disable-line no-console
        });
    }
  }

  start() {
    this.fileCollections.forEach((collection) => {
      const { stores, tempStore } = collection.options;
      const mongoCollection = collection.rawCollection || collection.collection;

      if (typeof mongoCollection.watch !== "function") {
        throw new Error("RemoteUrlWorker requires a version of the MongoDB Node library that has collection#watch method available");
      }

      const handle = mongoCollection.watch([{
        $match: {
          "operationType": "insert",
          "fullDocument.original.tempStoreId": { $ne: null }
        }
      }]);

      handle.on("change", (event) => {
        const { fullDocument } = event;
        this.pushObservedDocument(fullDocument, collection, stores, tempStore);
      });

      this.observeHandles.push(handle);
    });
  }

  stop() {
    this.observeHandles.forEach((handle) => {
      handle.close();
    });
    this.observeHandles = [];
  }

  async addDocumentByCollectionName(doc, collectionName) {
    const collection = this.fileCollections.find((fileCollection) => fileCollection.name === collectionName);

    if (!collection) {
      throw new Error(`Error: Collection ${collectionName} could not be found`);
    }

    const { stores, tempStore } = collection.options;
    await this.handleTempStoreIdAdded({ collection, doc, stores, tempStore });
  }

  async handleTempStoreIdAdded({ collection, doc, stores, tempStore }) {
    if (!tempStore) throw new Error(`TempFileStoreWorker cannot work the "${collection.name}" collection because it has no tempStore`);

    const { tempStoreId } = doc.original;

    if (!await tempStore.exists(tempStoreId)) {
      /* eslint-disable no-console */
      console.error(`TempFileStoreWorker: TempFileStore does not contain file ${tempStoreId} referenced by "${collection.name}" record with ID ${doc._id}. ` +
        "Clearing tempStoreId from the FileRecord.");
      /* eslint-enable no-console */
      await collection.update(doc._id, { $unset: { "original.tempStoreId": "" } }, { raw: true });
      return;
    }

    const fileRecord = new FileRecord(doc, { collection });
    const loggingIdentifier = fileRecord.name() || fileRecord._id;

    // We do these in series to avoid issues with multiple streams reading
    // from the temp store at the same time.
    try {
      await forEachPromise(stores, async (store) => {
        if (fileRecord.hasStored(store.name)) {
          debug(`TempFileStoreWorker: Already stored ${loggingIdentifier} to "${store.name}" store for "${collection.name}" collection. Skipping.`);
          return Promise.resolve();
        }

        debug(`TempFileStoreWorker: Transforming and storing ${loggingIdentifier} to "${store.name}" store for "${collection.name}" collection...`);

        // Make a new read stream in each loop because you can only read once
        const readStream = tempStore.createReadStream(tempStoreId);
        const writeStream = await store.createWriteStream(fileRecord);
        const promise = new Promise((resolve, reject) => {
          // It seems the underlying gridfs stream gets .destroy() called.
          // That results in an "error" event being emitted but without any arguments.
          // We need to only reject the promise on legit errors, so we ignore
          // missing errors
          fileRecord.once("error", (err) => err && reject(err));
          fileRecord.once("stored", resolve);
          readStream.pipe(writeStream);
        });

        return promise.then(() => {
          debug(`TempFileStoreWorker: Done storing ${loggingIdentifier} to "${store.name}" store`);
          return true;
        }).catch((error) => {
          throw error;
        });
      });
    } catch (error) {
      debug("TempFileStoreWorker: error in forEachPromise", error);
      throw new Error(`Error in TempFileStoreWorker storage loop: ${error && error.message}`, error);
    }

    debug(`TempFileStoreWorker: Done storing ${loggingIdentifier} to all stores. Removing tempStoreId prop.`);

    await collection.update(doc._id, { $unset: { "original.tempStoreId": "" } }, { raw: true });

    tempStore.deleteIfExists(tempStoreId).catch((error) => {
      console.error(error); // eslint-disable-line no-console
    });

    debug(`TempFileStoreWorker: tempStoreId prop removed for ${loggingIdentifier}`);
  }
}
