import { EventEmitter } from "events";
import FileRecord from "../common/FileRecord";
import debug from "./debug";

/**
 * From https://stackoverflow.com/a/41791149/1669674
 *
 * @param {Array} items An array of items.
 * @param {Function} fn A function that accepts an item from the array and returns a promise.
 * @returns {Promise} reduced items
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
  constructor({ fetch, fileCollections = [], onNewFileRecord } = {}) {
    super();

    this.fetch = fetch;
    this.fileCollections = fileCollections;
    this.observeHandles = [];
    this.isProcessing = false;
    this.observedEntries = [];
    this.onNewFileRecord = onNewFileRecord;
  }

  async processObserved(collection, stores) {
    debug("processObserved called");
    if (this.isProcessing) {
      debug("Queue is already processing, return");
      return;
    }
    this.isProcessing = true;

    const doc = this.observedEntries.shift();

    if (doc) {
      debug("There is another doc in the queue");
      await this.handleRemoteURLAdded({ collection, doc, stores })
        .catch((error) => {
          console.error(error); // eslint-disable-line no-console
        });
    }
    this.isProcessing = false;
    if (this.observedEntries.length) {
      debug(`There are ${this.observedEntries.length} more docs in the queue, starting new execution`);
      this.processObserved(collection, stores);
    }
    debug("processObserved queue finished");
  }

  pushObservedDocument(doc, collection, stores) {
    const { onNewFileRecord } = this;
    if (onNewFileRecord) {
      onNewFileRecord(doc, collection);
    } else {
      debug("No onNewFileRecord function passed to RemoteUrlWorker, using internal queue");
      this.observedEntries.push(doc);
      this.processObserved(collection, stores);
    }
  }

  start() {
    this.fileCollections.forEach((collection) => {
      const { stores } = collection.options;
      const mongoCollection = collection.rawCollection || collection.collection;

      if (typeof mongoCollection.watch !== "function") {
        throw new Error("RemoteUrlWorker requires a version of the MongoDB Node library that has collection#watch method available");
      }

      const handle = mongoCollection.watch([{
        $match: {
          "operationType": "insert",
          "fullDocument.original.remoteURL": { $ne: null }
        }
      }]);

      handle.on("change", (event) => {
        const { fullDocument } = event;
        this.pushObservedDocument(fullDocument, collection, stores);
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

    const { stores } = collection.options;
    await this.handleRemoteURLAdded({ collection, doc, stores });
  }

  async handleRemoteURLAdded({ collection, doc, stores }) {
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
          fileRecord.once("error", (err) => err && reject(err));
          fileRecord.once("stored", resolve);
          readStream.pipe(writeStream);
        });

        return promise.then(() => {
          debug(`RemoteUrlWorker: Done storing ${loggingIdentifier} to "${store.name}" store`);
          return true;
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
