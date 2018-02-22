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

export default class RemoteUrlWorker extends EventEmitter {
  constructor({ fetch, fileCollections = [] } = {}) {
    super();

    this.fetch = fetch;
    this.fileCollections = fileCollections;
    this.observeHandles = [];
  }

  start() {
    this.fileCollections.forEach((collection) => {
      const { stores } = collection.options;

      // Support for storing to multiple stores from a remote URL
      this.observeHandles.push(collection.mongoCollection.find({
        "original.remoteURL": { $ne: null }
      }).observe({
        added: (doc) => {
          this._handleRemoteURLAdded({ collection, doc, stores })
            .catch((error) => {
              console.error(error); // eslint-disable-line no-console
            });
        }
      }));
    });
  }

  stop() {
    this.observeHandles.forEach((handle) => {
      handle.stop();
    });
    this.observeHandles = [];
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
          debug(`RemoteUrlWorker: Already stored ${loggingIdentifier} to "${store.name}" store for "${collection.name}" collection. Skipping.`);
          return Promise.resolve();
        }

        debug(`RemoteUrlWorker: Transforming and storing ${loggingIdentifier} to "${store.name}" store for "${collection.name}" collection...`);

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
          debug(`RemoteUrlWorker: Done storing ${loggingIdentifier} to "${store.name}" store`);
        }).catch((error) => {
          throw error;
        });
      });
    } catch (error) {
      throw new Error("Error in RemoteUrlWorker remote URL storage loop:", error);
    }

    debug(`RemoteUrlWorker: Done storing ${loggingIdentifier} to all stores. Removing remoteURL prop.`);

    await collection.update(doc._id, { $unset: { "original.remoteURL": "" } }, { raw: true });

    debug(`RemoteUrlWorker: remoteURL prop removed for ${loggingIdentifier}`);
  }
}
