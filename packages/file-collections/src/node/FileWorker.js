import { EventEmitter } from "events";
import FileRecord from "../common/FileRecord";
import debug from "./debug";

/**
 * From https://stackoverflow.com/a/41791149/1669674
 *
 * @param items An array of items.
 * @param fn A function that accepts an item from the array and returns a promise.
 * @returns {Promise}
 */
function forEachPromise(items, fn) {
  return items.reduce(
    (promise, item) => promise
      .then(() => fn(item))
      .catch((error) => { throw error; }),
    Promise.resolve()
  );
}

export default class FileWorker extends EventEmitter {
  constructor({ fetch, fileCollections = [] } = {}) {
    super();

    this.fetch = fetch;
    this.fileCollections = fileCollections;
    this.tempStoreObserveHandles = [];
    this.remoteUrlObserveHandles = [];
  }

  startProcessingRemoteURLs() {
    this.fileCollections.forEach((collection) => {
      const { stores } = collection.options;

      // Support for storing to multiple stores from a remote URL
      this.remoteUrlObserveHandles.push(collection.mongoCollection.find({
        "original.remoteURL": { $ne: null }
      }).observe({
        added: (doc) => {
          this._handleRemoteURLAdded({ collection, doc, stores })
            .catch((error) => {
              console.error(error); // eslint-disable-line no-console
            });
        }
      })); // END "original.remoteURL" observe
    });
  }

  startProcessingUploads() {
    this.fileCollections.forEach((collection) => {
      const { stores, tempStore } = collection.options;

      // Support for storing to multiple stores from a tempStore
      this.tempStoreObserveHandles.push(collection.mongoCollection.find({
        "original.tempStoreId": { $ne: null }
      }).observe({
        added: (doc) => {
          this._handleTempStoreIdAdded({ collection, doc, stores, tempStore })
            .catch((error) => {
              console.error(error); // eslint-disable-line no-console
            });
        },
        removed(doc) {
          const { tempStoreId } = doc.original || {};

          debug(`FileWorker: Removing ${tempStoreId} from TempFileStore`);

          // Delete the file from the temp store if it exists
          tempStore.deleteIfExists(tempStoreId).catch((error) => {
            console.error(error); // eslint-disable-line no-console
          });
        }
      })); // END "original.tempStoreId" observe
    });
  }

  stopProcessingRemoteURLs() {
    this.remoteUrlObserveHandles.forEach((handle) => {
      handle.stop();
    });
    this.remoteUrlObserveHandles = [];
  }

  stopProcessingUploads() {
    this.tempStoreObserveHandles.forEach((handle) => {
      handle.stop();
    });
    this.tempStoreObserveHandles = [];
  }

  stopAll() {
    this.stopProcessingUploads();
    this.stopProcessingRemoteURLs();
  }

  async _handleRemoteURLAdded({ collection, doc, stores }) {
    const { fetch } = this;
    const { remoteURL } = doc.original;

    const fileRecord = new FileRecord(doc, { collection });
    const loggingIdentifier = fileRecord.name() || fileRecord._id;

    // We do these in series to avoid issues with multiple streams reading
    // from the temp store at the same time.
    try {
      await forEachPromise(stores, async (store) => {
        if (fileRecord.hasStored(store.name)) {
          debug(`FileWorker: Already stored ${loggingIdentifier} to "${store.name}" store for "${collection.name}" collection. Skipping.`);
          return Promise.resolve();
        }

        debug(`FileWorker: Transforming and storing ${loggingIdentifier} to "${store.name}" store for "${collection.name}" collection...`);

        // Make a new read stream in each loop because you can only read once
        const response = await fetch(remoteURL);
        const readStream = response.body;
        const writeStream = await store.createWriteStream(fileRecord);
        const promise = new Promise((resolve, reject) => {
          fileRecord.once("error", reject);
          fileRecord.once("stored", resolve);
          readStream.pipe(writeStream);
        });

        return promise.then(() => {
          debug(`FileWorker: Done storing ${loggingIdentifier} to "${store.name}" store`);
        }).catch((error) => {
          throw error;
        });
      });
    } catch (error) {
      throw new Error("Error in FileWorker remote URL storage loop:", error);
    }

    debug(`FileWorker: Done storing ${loggingIdentifier} to all stores. Removing remoteURL prop.`);

    await collection.update(doc._id, { $unset: { "original.remoteURL": "" } }, { raw: true });

    debug(`FileWorker: remoteURL prop removed for ${loggingIdentifier}`);
  }

  async _handleTempStoreIdAdded({ collection, doc, stores, tempStore }) {
    if (!tempStore) throw new Error(`FileWorker.run cannot work the "${collection.name}" collection because it has no tempStore`);

    const { tempStoreId } = doc.original;

    if (!await tempStore.exists(tempStoreId)) {
      /* eslint-disable no-console */
      console.error(`FileWorker: TempFileStore does not contain file ${tempStoreId} referenced by "${collection.name}" record with ID ${doc._id}. ` +
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
          debug(`FileWorker: Already stored ${loggingIdentifier} to "${store.name}" store for "${collection.name}" collection. Skipping.`);
          return Promise.resolve();
        }

        debug(`FileWorker: Transforming and storing ${loggingIdentifier} to "${store.name}" store for "${collection.name}" collection...`);

        // Make a new read stream in each loop because you can only read once
        const readStream = tempStore.createReadStream(tempStoreId);
        const writeStream = await store.createWriteStream(fileRecord);
        const promise = new Promise((resolve, reject) => {
          fileRecord.once("error", reject);
          fileRecord.once("stored", resolve);
          readStream.pipe(writeStream);
        });

        return promise.then(() => {
          debug(`FileWorker: Done storing ${loggingIdentifier} to "${store.name}" store`);
        }).catch((error) => {
          throw error;
        });
      });
    } catch (error) {
      throw new Error(`Error in FileWorker TempStore storage loop: ${error.message}`, error);
    }

    debug(`FileWorker: Done storing ${loggingIdentifier} to all stores. Removing tempStoreId prop.`);

    await collection.update(doc._id, { $unset: { "original.tempStoreId": "" } }, { raw: true });

    debug(`FileWorker: tempStoreId prop removed for ${loggingIdentifier}`);
  }
}
