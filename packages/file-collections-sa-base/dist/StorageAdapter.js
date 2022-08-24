"use strict";var _Object$keys = require("@babel/runtime-corejs2/core-js/object/keys");var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols");var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors");var _Object$defineProperties = require("@babel/runtime-corejs2/core-js/object/define-properties");var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");_Object$defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectWithoutProperties"));var _events = require("events");
var _stream = require("stream");
var _debug = _interopRequireDefault(require("./debug"));const _excluded = ["skipTransform"];function ownKeys(object, enumerableOnly) {var keys = _Object$keys(object);if (_Object$getOwnPropertySymbols) {var symbols = _Object$getOwnPropertySymbols(object);enumerableOnly && (symbols = symbols.filter(function (sym) {return _Object$getOwnPropertyDescriptor(object, sym).enumerable;})), keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = null != arguments[i] ? arguments[i] : {};i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {(0, _defineProperty2.default)(target, key, source[key]);}) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {_Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key));});}return target;}

const existingStoreNames = {};

/**
 * @param {FileStream} stream filestram
 * @param {String} storeName store name
 * @param {Number} id id of file
 * @return {void} null
 */
function logEventsForStream(stream, storeName, id) {
  ["close", "end", "finish", "stored"].forEach((evt) => {
    stream.on(evt, () => {
      (0, _debug.default)("STREAM", evt, storeName, id);
    });
  });

  stream.on("error", (error) => {
    (0, _debug.default)("STREAM error", storeName, id, error && (error.message || error.code));
  });
}

class StorageAdapter extends _events.EventEmitter {
  constructor({
    fileKeyMaker,
    name,
    transformRead,
    transformWrite } =
  {}) {
    super();

    if (typeof name !== "string" || name.length === 0 || name.indexOf(".") !== -1) {
      throw new Error('A storage adapter name must be a string that does not contain "."');
    }

    this.name = name;

    // Allow the user to override the adapter's default _fileKeyMaker() method
    if (typeof fileKeyMaker === "function") this._fileKeyMaker = fileKeyMaker;

    this.transformRead = transformRead;
    this.transformWrite = transformWrite;

    if (existingStoreNames[name]) throw new Error(`There is already another storage adapter named ${name}`);
    existingStoreNames[name] = true;
  }

  /**
   * @param {FileRecord} fileRecord A FileRecord instance. This is passed to this.fileKey to
   *   get the file key and to any `transformRead` functions defined for the store.
   * @param {Object} [options] Any options supported by the specific storage adapter
   * @returns {Promise} A promise that resolves with the stream.Readable
   */
  async createReadStream(fileRecord, options) {
    const store = this.name;

    // This call will allow the user to potentially modify fileRecord info for this store.
    // Make sure this stays before the `createReadStreamForFileKey` call, which then
    // uses the potentially modified file info.
    let transform;
    if (typeof this.transformRead === "function") {
      transform = await this.transformRead(fileRecord);
    }

    (0, _debug.default)("After transformRead file info is", fileRecord.infoForCopy(store));

    let sourceStream;
    let readStream;

    try {
      sourceStream = await this.createReadStreamForFileKey(this.fileKey(fileRecord), options);
      logEventsForStream(sourceStream, store, fileRecord._id);

      if (transform) {
        readStream = new _stream.PassThrough();
        sourceStream.pipe(transform).pipe(readStream);
      } else {
        readStream = sourceStream;
      }
    } catch (error) {
      throw new Error("StorageAdapter createReadStream couldn't create read stream");
    }

    sourceStream.on("error", (error) => {
      if (!error) {
        // This is a spurious error from stream.destroy() and needs to be disregarded.
        // https://github.com/reactioncommerce/reaction/issues/6310
        return;
      }
      const emitted = this.emit("error", error, fileRecord);
      if (!emitted) console.error(error); // eslint-disable-line no-console

      fileRecord.emit("error", error, store);
    });

    return readStream;
  }

  /**
   * @param {any} fileKey A key created by calling this.fileKey(fileRecord)
   * @param {Object} [options] Any options supported by the specific storage adapter
   * @returns {Promise} A promise that resolves with the stream.Readable
   */
  async createReadStreamForFileKey(fileKey, options) {
    return this._getReadStream(fileKey, options);
  }

  /**
   * @param {FileRecord} fileRecord A FileRecord instance. This is passed to this.fileKey to
   *   get the file key and to any `transformWrite` functions defined for the store.
   * @param {Object} [options] Any options supported by the specific storage adapter, plus...
   * @param {Boolean} [options.skipTransform] Set to false to skip applying the transformWrite function
   * @returns {Promise} A promise that resolves with the stream.Writable
   */
  async createWriteStream(fileRecord, options) {
    const _ref = options || {},{ skipTransform } = _ref,adapterOptions = (0, _objectWithoutProperties2.default)(_ref, _excluded);

    // If we haven't set name, type, or size for this store yet,
    // set it to same values as the original upload. We don't save
    // these to the DB right away because they might be changed
    // in a transformWrite function.
    const store = this.name;
    if (!fileRecord.name({ store })) {
      fileRecord.name(fileRecord.name(), { store });
    }
    if (!fileRecord.type({ store })) {
      fileRecord.type(fileRecord.type(), { store });
    }

    // This call will allow the user to potentially modify fileRecord info for this store.
    // Make sure this stays before the `createWriteStreamForFileKey` call, which then
    // uses the potentially modified file info.
    let transform;
    if (!skipTransform && typeof this.transformWrite === "function") {
      transform = await this.transformWrite(fileRecord);
    }

    (0, _debug.default)("After transformWrite file info is", fileRecord.infoForCopy(store));

    let finalDestinationStream;
    let writeStream;

    try {
      finalDestinationStream = await this.createWriteStreamForFileKey(this.fileKey(fileRecord), _objectSpread({
        // Some storage adapters need this
        content_type: fileRecord.type({ store }) },
      adapterOptions));

      logEventsForStream(finalDestinationStream, store, fileRecord._id);

      if (transform) {
        writeStream = new _stream.PassThrough();
        writeStream.pipe(transform).pipe(finalDestinationStream);
      } else {
        writeStream = finalDestinationStream;
      }
    } catch (error) {
      throw new Error("StorageAdapter createWriteStream couldn't create write stream");
    }

    const emitError = (error) => {
      if (!error) {
        // This is a spurious error from stream.destroy() and needs to be disregarded.
        // https://github.com/reactioncommerce/reaction/issues/6310
        return;
      }
      const emitted = this.emit("error", error, fileRecord);
      if (!emitted) console.error(error); // eslint-disable-line no-console

      fileRecord.emit("error", error, store);
    };

    // Listen for "stored" event to know that the specific adapter has finished storing
    finalDestinationStream.once("stored", ({ fileKey, size, storedAt, externalUrl }) => {
      (0, _debug.default)(`StorageAdapter writeStream "stored" event handler called for fileKey ${fileKey} in "${store}" store`);

      if (!fileKey) throw new Error(`Storage adapter ${store} of type ${this.typeName} did not return a fileKey`);

      // Set the fileKey
      fileRecord.key(fileKey, { store });

      // And record which adapter stored it
      fileRecord.storageAdapter(this.typeName, { store });

      // set the externalUrl if it's provided
      if (externalUrl) fileRecord.externalUrl(externalUrl, { store });

      // Update the size, as provided by the SA, in case it was changed by stream transformation
      if (typeof size === "number") fileRecord.size(size, { store });

      // Set last updated time, either provided by SA or now
      const updatedAt = storedAt || new Date();
      fileRecord.updatedAt(updatedAt, { store });

      // If the file object copy does not have a createdAt, set it
      if (!fileRecord.createdAt({ store })) fileRecord.createdAt(updatedAt, { store });

      // Don't want to use await here because making an event listener async will result
      // in unhandled exceptions
      (0, _debug.default)("StorageAdapter saving copy info...");
      fileRecord.saveCopyInfo(store).
      then(() => {
        (0, _debug.default)("StorageAdapter successfully saved copy info");
        writeStream.emit("stored");
        this.emit("stored", fileRecord);
        fileRecord.emit("stored", store);
        return;
      }).
      catch((error) => {
        (0, _debug.default)("saveCopyInfo error", error);
        emitError(new Error(`StorageAdapter error saving copy info: ${error && (error.message || "error is undefined")}`));
      });
    });

    finalDestinationStream.on("error", emitError);

    return writeStream;
  }

  /**
   * @param {any} fileKey A key created by calling this.fileKey(fileRecord)
   * @param {Object} [options] Any options supported by the specific storage adapter
   * @returns {Promise} A promise that resolves with the stream.Writable
   */
  async createWriteStreamForFileKey(fileKey, options) {
    if (!fileKey) throw new Error("createWriteStreamForFileKey requires fileKey argument");
    return this._getWriteStream(fileKey, options);
  }

  fileKey(fileRecord) {
    return this._fileKeyMaker(fileRecord);
  }

  remove(fileRecord) {
    (0, _debug.default)(`StorageAdapter.remove called for file record ${fileRecord._id}`);
    return this._removeFile(this.fileKey(fileRecord));
  }

  set typeName(value) {
    this._typeName = value;
  }

  // SA MUST OVERRIDE THIS
  // Must return a stream.Readable or a promise that returns the stream
  _getReadStream() {
    throw new Error(`${this.name} storage adapter does not properly override the _getReadStream method`);
  }

  // SA MUST OVERRIDE THIS
  // Must return a stream.Writable or a promise that returns the stream
  _getWriteStream() {
    throw new Error(`${this.name} storage adapter does not properly override the _getWriteStream method`);
  }

  // SA MUST OVERRIDE THIS
  // Must return a file key of any type, as long as the adapter can later
  // use it to retrieve the file data.
  _fileKeyMaker() {
    throw new Error(`${this.name} storage adapter does not properly override the _fileKeyMaker method`);
  }

  // SA MUST OVERRIDE THIS
  _removeFile() {
    throw new Error(`${this.name} storage adapter does not properly override the _removeFile method`);
  }

  // SA MUST OVERRIDE THIS
  get typeName() {
    if (!this._typeName) throw new Error(`${this.name} storage adapter does not properly override the typeName property`);
    return this._typeName;
  }}exports.default = StorageAdapter;