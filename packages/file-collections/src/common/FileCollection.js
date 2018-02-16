import { EventEmitter } from "events";
import FileRecord from "./FileRecord";

// https://stackoverflow.com/a/35813135/1669674
const isNode = (typeof process !== "undefined") && process.release && (process.release.name === "node");

export default class FileCollection extends EventEmitter {
  constructor(name, options) {
    super();

    this.name = name;
    this.storesLookup = {};

    this.options = {
      shouldAllowGet: () => false,
      stores: [],
      tempStore: null,
      ...(options || {})
    };

    const { stores } = this.options;

    // Make sure at least one store has been supplied if we're not in a browser
    if (isNode && (!Array.isArray(stores) || stores.length === 0)) {
      throw new Error("You must specify at least one store in the stores array.");
    }

    stores.forEach((store) => {
      // Check for duplicates
      const { name: storeName } = store;
      if (this.storesLookup[storeName]) {
        throw new Error(`FileCollection store names must be unique. Two stores are named "${storeName}"`);
      }
      this.storesLookup[storeName] = store;

      store.on("stored", this.getStoreSuccessHandler(storeName));
      store.on("error", this.getStoreErrorHandler(storeName));
    });
  }

  /**
   * @method getStoreSuccessHandler
   * @private
   * @param {String} storeName
   * @return {Function} A function to use as the handler for a "stored" event emitted by a StorageAdapter instance
   *
   * Whenever a store emits "stored" and the passed FileRecord instance is linked with this FileCollection,
   * this will emit "stored" on the FileCollection instance as well.
   */
  getStoreSuccessHandler(storeName) {
    return (fileRecord) => {
      // When a file is successfully stored into the store, we emit a "stored" event on the FileCollection only if the file belongs to this collection
      if (fileRecord.collectionName === this.name) {
        this.emit("stored", fileRecord, storeName);
      }
    };
  }

  /**
   * @method getStoreErrorHandler
   * @private
   * @param {String} storeName
   * @return {Function} A function to use as the handler for a "error" event emitted by a StorageAdapter instance
   *
   * Whenever a store emits "error" and the passed FileRecord instance is linked with this FileCollection,
   * this will emit "error" on the FileCollection instance as well.
   */
  getStoreErrorHandler(storeName) {
    return (error, fileRecord) => {
      // When a file has an error while being stored into the temp store, we emit an "error" event on the FS.Collection only if the file belongs to this collection
      if (fileRecord.collectionName === this.name) {
        const storeError = new Error(`Error storing file to the ${storeName} store: ${error.message}`);
        this.emit("error", storeError, fileRecord, storeName);
      }
    };
  }

  async insert(fileRecord, options = {}) {
    if (!(fileRecord instanceof FileRecord)) throw new Error("Argument to FileCollection.insert must be a FileRecord instance");
    if (!fileRecord.collection) {
      fileRecord.attachCollection(this);
    } else if (fileRecord.collectionName !== this.name) {
      throw new Error(`You are trying to insert FileRecord for ${fileRecord.name()} into the "${this.name}" FileCollection but it is attached to the ` +
        `"${fileRecord.collectionName}" FileCollection`);
    }
    const insertedDoc = await this._insert(fileRecord.document, options);
    if (!insertedDoc || options.raw) return insertedDoc || undefined;
    return new FileRecord(insertedDoc, { collection: this });
  }

  async update(id, doc, options = {}) {
    if (!id) throw new Error("FileCollection update requires a FileRecord ID.");
    if (typeof id !== "string") throw new Error(`FileCollection update requires a single ID and updated document. Multiple not supported. Received: ${id}`);
    const updatedDoc = await this._update(id, doc, options);
    if (!updatedDoc || options.raw) return updatedDoc || undefined;
    return new FileRecord(updatedDoc, { collection: this });
  }

  async remove(id, options = {}) {
    let fileRecord;
    let ID;
    if (id instanceof FileRecord) {
      fileRecord = id;
      ID = fileRecord._id;
    } else {
      fileRecord = await this.findOne(id);
      ID = id;
    }

    // Remove all copies from all stores first. Stores won't be defined in browser code
    // so this will run on Node only.
    const { stores } = this.options;
    if (Array.isArray(stores)) {
      await Promise.all(stores.map((store) => store.remove(fileRecord)));
    }

    // Then remove the FileRecord from the database
    return this._remove(ID, options);
  }

  async findOne(id, options = {}) {
    const doc = await this._findOne(id, options);
    if (!doc || options.raw) return doc || undefined;
    return new FileRecord(doc, { collection: this });
  }

  async find(selector, options = {}) {
    const docs = await this._find(selector, options);
    if (options.raw) return docs;
    return docs.map((doc) => new FileRecord(doc, { collection: this }));
  }

  findOneLocal(id, options = {}) {
    const doc = this._findOneLocal(id, options);
    if (!doc || options.raw) return doc || undefined;
    return new FileRecord(doc, { collection: this });
  }

  findLocal(selector, options = {}) {
    const docs = this._findLocal(selector, options);
    if (options.raw) return docs;
    return docs.map((doc) => new FileRecord(doc, { collection: this }));
  }

  async shouldAllowGet(fileRecord, req, storeName) {
    return Promise.resolve(this.options.shouldAllowGet(fileRecord, req, storeName));
  }

  getStore(storeName) {
    return this.storesLookup[storeName];
  }

  // Must insert doc into a database and then return a Promise that resolves with the inserted doc
  _insert() {
    throw new Error(`${this.constructor.name} does not properly override the _insert method`);
  }

  // Must update doc in the database and then return a Promise that resolves with the full updated doc
  _update() {
    throw new Error(`${this.constructor.name} does not properly override the _update method`);
  }

  // Must remove doc by ID from database and then return a Promise that resolves if successful
  _remove() {
    throw new Error(`${this.constructor.name} does not properly override the _remove method`);
  }

  // Must return a Promise that resolves with the file document with the given ID
  _findOne() {
    throw new Error(`${this.constructor.name} does not properly override the _findOne method`);
  }

  // Must return a Promise that resolves with an array of file documents that match the selector
  _find() {
    throw new Error(`${this.constructor.name} does not properly override the _find method`);
  }

  // In browser code only, may provide a function that returns the document from a local store
  _findOneLocal() {
    throw new Error(`${this.constructor.name} does not properly override the _findOne method`);
  }

  // In browser code only, may provide a function that returns an array of documents or cursor from a local store
  _findLocal() {
    throw new Error(`${this.constructor.name} does not properly override the _find method`);
  }
}
