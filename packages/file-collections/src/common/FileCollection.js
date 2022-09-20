import { EventEmitter } from "events";
import FileRecord from "./FileRecord";

// https://stackoverflow.com/a/35813135/1669674
const isNode = (typeof process !== "undefined") && process.release && (process.release.name === "node");

/**
 * A generic FileCollection class. This must be extended to add specific
 * handling for a certain type of backing storage.
 */
export default class FileCollection extends EventEmitter {
  /**
   * @constructor FileCollection
   * @param {String} name The name you want to use to refer to the FileCollection.
   *   Be sure to use the same name in Node and browser code.
   * @param {Object} options options for collection
   * @param {Function} options.allowGet A function that returns `true` if a GET request for a file should be allowed
   * @param {StorageAdapter[]} options.stores An array of instances of classes that extend StorageAdapter
   * @param {TempFileStore} options.tempStore A temporary store to support chunked file uploads from browsers.
   */
  constructor(name, options) {
    super();

    this.name = name;
    this.storesLookup = {};

    this.options = {
      allowGet: () => false,
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
   * @param {String} storeName name of the store
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
   * @param {String} storeName name of the store
   * @return {Function} A function to use as the handler for a "error" event emitted by a StorageAdapter instance
   *
   * Whenever a store emits "error" and the passed FileRecord instance is linked with this FileCollection,
   * this will emit "error" on the FileCollection instance as well.
   */
  getStoreErrorHandler(storeName) {
    return (error, fileRecord) => {
      // When a file has an error while being stored into the temp store, we emit an "error" event on the FS.Collection only if the file belongs to this collection
      if (fileRecord.collectionName === this.name) {
        if (!error) {
          // Nothing to be done about empty errors from stream.destroy() calls
          return;
        }
        const storeError = new Error(`Error from ${storeName} store: ${error && (error.message || "error is undefined")}`);
        this.emit("error", storeError, fileRecord, storeName);
      }
    };
  }

  /**
   * @method insert
   * @param {FileRecord} fileRecord fileRecord object
   * @param {Object} options options for insert
   * @param {Boolean} [options.raw] True to get back the raw inserted document rather than a FileRecord
   * @returns {Promise<FileRecord|Object>} The inserted FileRecord or a plain object if `raw` option was `true`
   *
   * The actual behavior depends on how the specific class implements the _insert
   * method, which will also vary in browser code vs. Node. In general, the document
   * attached to the FileRecord will be inserted into a database somehow.
   *
   * Options are passed along to _insert
   */
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

  /**
   * @method update
   * @param {String} id FileRecord ID
   * @param {Object} doc Updated document, modifier, or whatever _update expects
   * @param {Object} options options for update
   * @param {Boolean} [options.raw] True to get back the raw updated document rather than a FileRecord
   * @returns {Promise<FileRecord|Object>} The updated FileRecord or a plain object if `raw` option was `true`
   *
   * The actual behavior depends on how the specific class implements the _update
   * method, which will also vary in browser code vs. Node. In general, the doc argument
   * will be used to update what is stored in a database somehow.
   *
   * Options are passed along to _update
   */
  async update(id, doc, options = {}) {
    if (!id) throw new Error("FileCollection update requires a FileRecord ID.");
    if (typeof id !== "string") throw new Error(`FileCollection update requires a single ID and updated document. Multiple not supported. Received: ${id}`);
    const updatedDoc = await this._update(id, doc, options);
    if (!updatedDoc || options.raw) return updatedDoc || undefined;
    return new FileRecord(updatedDoc, { collection: this });
  }

  /**
   * @method remove
   * @param {String|FileRecord} id FileRecord ID or a FileRecord instance
   * @param {Object} options options for remove
   * @returns {Promise<Boolean>} True if removed
   *
   * The actual behavior depends on how the specific class implements the _remove
   * method, which will also vary in browser code vs. Node. In general, the FileRecord
   * with the given ID will be removed from a database somehow.
   *
   * In Node (whenever `stores` array was passed), the FileRecord will first
   * be removed from all stores as well.
   *
   * Options are passed along to _remove
   */
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

  /**
   * @method findOne
   * @param {Object|String} selector FileRecord ID or query selector of some sort
   * @param {Object} options options for _findOne
   * @param {Boolean} [options.raw] True to get back the raw document rather than a FileRecord
   * @returns {Promise<FileRecord|Object>} The document or FileRecord instance
   *
   * The actual behavior depends on how the specific class implements the _findOne
   * method, which will also vary in browser code vs. Node. In general, the FileRecord
   * with the given ID will be returned.
   *
   * Options are passed along to _findOne
   */
  async findOne(selector, options = {}) {
    const doc = await this._findOne(selector, options);
    if (!doc || options.raw) return doc || undefined;
    return new FileRecord(doc, { collection: this });
  }

  /**
   * @method find
   * @param {Object} selector A selector understood by the specific subclass
   * @param {Object} options options for _find
   * @param {Boolean} [options.raw] True to get back the raw document rather than a FileRecord
   * @returns {Promise<FileRecord[]|any>} An array of FileRecords, or whatever _find returns if raw option is `true`
   *
   * The actual behavior depends on how the specific class implements the _find
   * method, which will also vary in browser code vs. Node. In general, an array of
   * FileRecords that match the given selector will be returned.
   *
   * Options are passed along to _find
   */
  async find(selector, options = {}) {
    const docs = await this._find(selector, options);
    if (options.raw) return docs;
    return docs.map((doc) => new FileRecord(doc, { collection: this }));
  }

  /**
   * @method findOneLocal
   * @param {Object} selector A selector understood by the specific subclass
   * @param {Object} options options for _find
   * @returns {FileRecord} File record found
   * Similar to findOne, except that it calls _findOneLocal and
   * synchronously return a FileRecord or raw document.
   */
  findOneLocal(selector, options = {}) {
    const doc = this._findOneLocal(selector, options);
    if (!doc || options.raw) return doc || undefined;
    return new FileRecord(doc, { collection: this });
  }

  /**
   * @method findLocal
   * @param {Object} selector A selector understood by the specific subclass
   * @param {Object} options options for _find
   * @returns {FileRecord} File record found
   * Similar to find, except that it calls _findLocal and
   * synchronously returns an array of FileRecords or the result.
   */
  findLocal(selector, options = {}) {
    const docs = this._findLocal(selector, options);
    if (options.raw) return docs;
    return docs.map((doc) => new FileRecord(doc, { collection: this }));
  }

  /**
   * @method shouldAllowGet
   * @param {FileRecord} fileRecord file record to be found
   * @param {Request} req An incoming request
   * @param {String} storeName The store from which a file in this collection is being requested.
   * @returns {Promise<Boolean>} Returns whatever the allowGet function passed as a constructor option
   *   returns, which should be `true` to allow or `false` to send a Forbidden response.
   */
  async shouldAllowGet(fileRecord, req, storeName) {
    return this.options.allowGet(fileRecord, req, storeName);
  }

  /**
   * @method getStore
   * @param {String} storeName name of store
   * @returns {StorageAdapter} Returns a store instance from its name
   */
  getStore(storeName) {
    return this.storesLookup[storeName];
  }

  /**
   * The remaining methods must be overridden when subclassing
   */

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

  // May provide a function that returns the document from a local store
  _findOneLocal() {
    throw new Error(`${this.constructor.name} does not properly override the _findOne method`);
  }

  // May provide a function that returns an array of documents or cursor from a local store
  _findLocal() {
    throw new Error(`${this.constructor.name} does not properly override the _find method`);
  }
}
