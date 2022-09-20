/* global File, Blob */ // eslint-disable-line no-redeclare

import { EventEmitter } from "events";
import * as tus from "tus-js-client";
import getUrlForFileRecord from "./url";

const isNode = typeof process !== "undefined" &&
  process.versions &&
  process.versions.node;

/**
 * @param {String} name name of file
 * @returns {String} extension string or ''
 */
function getFileExtensionFromFileName(name) {
  // Seek the last '.' if found
  const found = name.lastIndexOf(".");
  // Return the extension if found else ''
  // If found is -1, we return '' because there is no extension
  // If found is 0, we return '' because it's a hidden file
  return (found > 0 ? name.slice(found + 1).toLowerCase() : "");
}

/**
 * @param {String} url url to split
 * @returns {String} string after last slash of URL
 */
function getFileNameFromUrl(url) {
  const result = url.split("?")[0];
  // strip off beginning path or url
  const lastSlash = result.lastIndexOf("/");
  if (lastSlash !== -1) return result.slice(lastSlash + 1);
  return result;
}

/**
 * @param {String} name name of file
 * @param {String} ext extension of file
 * @returns {Strong} concat of name and ext
 */
function setFileExtension(name, ext) {
  if (!name || !name.length) return name;
  const currentExt = getFileExtensionFromFileName(name);
  if (currentExt.length) return name.slice(0, currentExt.length * -1) + ext;
  return `${name}.${ext}`;
}

/**
 * @param {String} value value of getter
 * @param {Object} options options object
 * @returns {Object} settings object
 */
function parseGetterSetterArgs(value, options) {
  if (!options && ((typeof value === "object" && value !== null) || typeof value === "undefined")) {
    return { isGetting: true, resolvedOptions: value || {} };
  }
  return { isGetting: false, resolvedOptions: options || {} };
}

/**
 * @param {String} storeName name of store
 * @param {Object} document files object
 * @param {String} property index of document object
 * @param {String} value value to add to document
 * @returns {void} null
 */
function setInfoForStore(storeName, document, property, value) {
  if (!document) return;

  if (typeof storeName === "string") {
    if (!document.copies) document.copies = {};
    if (!document.copies[storeName]) document.copies[storeName] = {};
    document.copies[storeName][property] = value;
    return;
  }

  if (!document.original) document.original = {};
  document.original[property] = value;
}

export default class FileRecord extends EventEmitter {
  constructor(document, { collection } = {}) {
    super();

    this.data = null;
    this.document = document;

    this.attachCollection(collection);
  }

  static get uploadEndpoint() {
    return this._uploadEndpoint || "/uploads/";
  }

  static set uploadEndpoint(value) {
    let endpoint = value;
    if (typeof endpoint === "string") {
      if (!endpoint.startsWith("/")) endpoint = `/${endpoint}`;
      if (!endpoint.endsWith("/")) endpoint = `${endpoint}/`;
    }
    this._uploadEndpoint = endpoint;
  }

  static get downloadEndpointPrefix() {
    return this._downloadEndpointPrefix || "/files";
  }

  static set downloadEndpointPrefix(value) {
    let endpoint = value;
    if (typeof endpoint === "string") {
      if (!endpoint.startsWith("/")) endpoint = `/${endpoint}`;
      if (endpoint.endsWith("/")) endpoint = endpoint.slice(0, -1);
    }
    this._downloadEndpointPrefix = endpoint;
  }

  static get absoluteUrlPrefix() {
    return this._absoluteUrlPrefix;
  }

  static set absoluteUrlPrefix(value) {
    let endpoint = value;
    if (typeof endpoint === "string" && endpoint.endsWith("/")) endpoint = endpoint.slice(0, -1);
    this._absoluteUrlPrefix = endpoint;
  }

  static get absoluteUploadUrl() {
    return `${this._absoluteUrlPrefix || ""}${this.uploadEndpoint}`;
  }

  attachCollection(collection) {
    this.collection = collection || null;
    this.collectionName = (collection && collection.name) || null;
  }

  detachCollection() {
    this.attachCollection(null);
  }

  attachData(data) {
    if (!data) throw new Error("FileRecord.attachData requires a data argument with some data");
    if (isNode && typeof Blob !== "undefined" && data instanceof Blob) {
      // In a Node env only, tus requires that the data be a stream
      this.data = data.stream();
    } else {
      this.data = data;
    }
    return this;
  }

  static fromBlob(blob, options) {
    if (typeof Blob === "undefined") throw new Error("FileRecord.fromBlob: Blob must be defined globally");
    if (!(blob instanceof Blob)) throw new Error("FileRecord.fromBlob: first argument is not an instance of Blob");
    const { name, size, type } = blob;
    const fileRecord = new FileRecord({ original: { name, size, type, updatedAt: new Date() } }, options);
    return fileRecord.attachData(blob);
  }

  static fromFile(file, options) {
    if (typeof File === "undefined") throw new Error("FileRecord.fromFile: File must be defined globally");
    if (!(file instanceof File)) throw new Error("FileRecord.fromFile: first argument is not an instance of File");
    const { lastModified, lastModifiedDate, name, size, type } = file;

    // `lastModifiedDate` is deprecated and removed from some browsers.
    // `lastModified` is the new one but is a number of milliseconds.
    // If all else fails, use now.
    let updatedAt;
    if (lastModified) {
      updatedAt = new Date(lastModified);
    } else {
      updatedAt = lastModifiedDate || new Date();
    }

    const fileRecord = new FileRecord({
      original: { name, size, type, updatedAt }
    }, options);

    return fileRecord.attachData(file);
  }

  static async fromUrl(url, options) {
    const { fetch } = options;
    if (!fetch) throw new Error("FileRecord.fromUrl requires that you pass in a fetch function");
    const response = await fetch(url, { method: "HEAD" });
    const headers = response.headers.raw();
    const doc = {
      original: {
        name: getFileNameFromUrl(url),
        type: headers["content-type"] || null,
        size: Number(headers["content-length"]),
        updatedAt: new Date(headers["last-modified"]),
        remoteURL: url // This triggers the RemoteUrlWorker to download and store copies
      }
    };
    return new FileRecord(doc, options);
  }

  get _id() {
    return (this.document && this.document._id) || null;
  }

  set _id(value) {
    if (!this.document) this.document = {};
    this.document._id = value || null;
  }

  get metadata() {
    if (!this.document) this.document = {};
    if (!this.document.metadata) this.document.metadata = {};
    return this.document.metadata;
  }

  set metadata(value) {
    if (!this.document) this.document = {};
    this.document.metadata = value || null;
  }

  async syncDocumentFromDB() {
    if (!this.collection) {
      throw new Error("Cannot syncDocumentFromDB for a file that is not associated with a collection");
    }
    if (!this._id) {
      throw new Error("Cannot syncDocumentFromDB for a file with no _id");
    }

    this.document = await this.collection.findOne(this._id, { raw: true });
    return this;
  }

  isAudio({ store } = {}) {
    return (this.type({ store }) || "").startsWith("audio/");
  }

  isImage({ store } = {}) {
    return (this.type({ store }) || "").startsWith("image/");
  }

  isVideo({ store } = {}) {
    return (this.type({ store }) || "").startsWith("video/");
  }

  isUploaded() {
    return !!(this.document && this.document.original && this.document.original.uploadedAt);
  }

  // Uploads the data that is attached to the FileRecord. Returns a Promise that
  // resolves with the new tempStoreId after the upload is complete.
  upload({
    // tus-js-client defaults chunkSize to Infinity but we do 5MB
    chunkSize = 5 * 1024 * 1024,
    endpoint = FileRecord.absoluteUploadUrl
  } = {}) {
    return new Promise((resolve, reject) => {
      if (!endpoint) {
        reject(new Error("Cannot upload file. You must pass \"endpoint\" option to FileRecord.upload or set FileRecord.uploadEndpoint"));
        return;
      }

      if (!this.data) {
        reject(new Error("Cannot upload a file that is not associated with any data"));
        return;
      }

      if (this._id) {
        reject(new Error("Cannot upload for a FileRecord that already has an ID"));
        return;
      }

      const { name, size, type } = this.infoForOriginal();

      if (!name || !size || !type) {
        reject(new Error("Cannot upload for a FileRecord until you set a name, size, and type for the original file"));
        return;
      }

      // Create a new tus upload
      this.tusUploadInstance = new tus.Upload(this.data, {
        chunkSize,
        endpoint,
        resume: true,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: { name, size, type },
        uploadSize: size,
        onError(error) {
          reject(error);
        },
        onChunkComplete: (_, bytesUploaded, bytesTotal) => {
          const percentage = (bytesUploaded / bytesTotal * 100);
          this.emit("uploadProgress", { bytesUploaded, bytesTotal, percentage });
        },
        onSuccess: () => {
          const slashPieces = this.tusUploadInstance.url.split("/");
          const tempStoreId = slashPieces.pop();
          this.document.original = {
            ...this.document.original,
            tempStoreId,
            uploadedAt: new Date()
          };
          this.tusUploadInstance = null;
          resolve(tempStoreId);
        }
      });

      this.startUpload();
    });
  }

  stopUpload() {
    if (!this.tusUploadInstance) return;
    this.tusUploadInstance.abort();
  }

  startUpload() {
    if (!this.tusUploadInstance) return;
    this.tusUploadInstance.start();
  }

  /**
   * @method fullClone
   * @param {Object} [newMetaData] Object to be extended on top of existing metadata object
   * @returns {FileRecord} A clone of this file record, already saved to database. All file
   *   data is also copied in the attached stores.
   */
  async fullClone(newMetaData) {
    const fileCollection = this.collection;
    if (!fileCollection) throw new Error("Cannot clone a file that is not associated with a collection");

    if ((fileCollection.options.stores || []).length === 0) {
      throw new Error("Cannot clone a file that is associated with a collection that has no linked stores. Cloning only available in Node.");
    }

    const clonedFileRecord = new FileRecord({
      original: this.document.original,
      metadata: {
        ...(this.metadata || {}),
        ...(newMetaData || {})
      }
    });

    const cloneRecord = await fileCollection.insert(clonedFileRecord);

    // Copy underlying files in all stores
    const storeNames = Object.keys(this.document.copies || {});
    const copyingPromises = storeNames.map(async (storeName) => {
      const store = fileCollection.getStore(storeName);

      // Get the readStream to read the currently stored file out. We use createReadStreamForFileKey
      // rather than createReadStream in order to bypass any potential transformRead function
      const readStream = await store.createReadStreamForFileKey(store.fileKey(this));

      // Get the writeStream to write back in for the clone. Skip transforms because we are writing
      // file data that was already transformed when originally saved.
      const writeStream = await store.createWriteStream(cloneRecord, { skipTransform: true });

      return new Promise((resolve, reject) => {
        writeStream.once("error", (err) => err && reject(err));
        writeStream.once("stored", resolve);
        readStream.pipe(writeStream);
      });
    });

    return Promise.all(copyingPromises);
  }

  update(modifier, options) {
    return new Promise((resolve, reject) => {
      if (!this.collection) {
        reject(new Error("Cannot update a file that is not associated with a collection"));
        return;
      }

      if (!this._id) {
        reject(new Error("Cannot update a file that has no ID"));
        return;
      }

      this.collection.update(this._id, modifier, options).then(resolve).catch(reject);
    });
  }

  url(options) {
    const externalUrl = this.externalUrl(options);
    if (externalUrl) return externalUrl;

    return getUrlForFileRecord(this, {
      absoluteUrlPrefix: FileRecord.absoluteUrlPrefix,
      prefix: FileRecord.downloadEndpointPrefix,
      ...options
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      if (!this.collection) {
        reject(new Error("Cannot remove a file that is not associated with a collection"));
        return;
      }

      if (!this._id) {
        reject(new Error("Cannot update a file that has no ID"));
        return;
      }

      this.collection.remove(this._id)
        .then((result) => {
          this.detachCollection();
          return resolve(result);
        })
        .catch(reject);
    });
  }

  infoForOriginal() {
    return (this.document && this.document.original) || {};
  }

  infoForCopy(storeName) {
    return (this.document && this.document.copies && this.document.copies[storeName]) || {};
  }

  _getOrSetInfo(prop, value, options) {
    const { isGetting, resolvedOptions } = parseGetterSetterArgs(value, options);

    const { store } = resolvedOptions;
    if (isGetting) {
      return store ? this.infoForCopy(store)[prop] : this.infoForOriginal()[prop];
    }

    return setInfoForStore(store, this.document, prop, value);
  }

  key(value, options) {
    return this._getOrSetInfo("key", value, options);
  }

  name(value, options) {
    return this._getOrSetInfo("name", value, options);
  }

  externalUrl(value, options) {
    return this._getOrSetInfo("externalUrl", value, options);
  }

  extension(value, options) {
    const { isGetting, resolvedOptions } = parseGetterSetterArgs(value, options);

    const { store } = resolvedOptions;
    const name = store ? this.infoForCopy(store).name : this.infoForOriginal().name;
    if (!name) return undefined;

    if (isGetting) {
      getFileExtensionFromFileName(name);
    } else {
      const newName = setFileExtension(name, value);
      setInfoForStore(store, this.document, "name", newName);
    }
  }

  size(value, options) {
    return this._getOrSetInfo("size", value, options);
  }

  type(value, options) {
    return this._getOrSetInfo("type", value, options);
  }

  storageAdapter(value, options) {
    return this._getOrSetInfo("storageAdapter", value, options);
  }

  createdAt(value, options) {
    return this._getOrSetInfo("createdAt", value, options);
  }

  updatedAt(value, options) {
    return this._getOrSetInfo("updatedAt", value, options);
  }

  hasStored(storeName) {
    return typeof storeName === "string" ? !!(this.infoForCopy(storeName).key) : !!(this.infoForOriginal().key);
  }

  saveOriginalInfo() {
    if (!this.document) return Promise.resolve();

    return this.update({
      $set: {
        original: this.document.original
      }
    }, { raw: true });
  }

  saveCopyInfo(storeName) {
    if (!this.document || !this.document.copies || !this.document.copies[storeName]) {
      return Promise.resolve();
    }

    return this.update({
      $set: {
        [`copies.${storeName}`]: this.document.copies[storeName]
      }
    }, { raw: true });
  }

  createReadStreamFromStore(storeName, range) {
    if (!this.collection) throw new Error("createReadStreamFromStore called without an attached collection");
    return this.collection.getStore(storeName).createReadStream(this, range);
  }
}
