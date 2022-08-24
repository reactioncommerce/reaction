"use strict";var _Object$keys = require("@babel/runtime-corejs2/core-js/object/keys");var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols");var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors");var _Object$defineProperties = require("@babel/runtime-corejs2/core-js/object/define-properties");var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");_Object$defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));var _gridfsStream = _interopRequireDefault(require("gridfs-stream"));
var _fileCollectionsSaBase = _interopRequireDefault(require("@reactioncommerce/file-collections-sa-base"));
var _debug = _interopRequireDefault(require("./debug"));function ownKeys(object, enumerableOnly) {var keys = _Object$keys(object);if (_Object$getOwnPropertySymbols) {var symbols = _Object$getOwnPropertySymbols(object);enumerableOnly && (symbols = symbols.filter(function (sym) {return _Object$getOwnPropertyDescriptor(object, sym).enumerable;})), keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = null != arguments[i] ? arguments[i] : {};i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {(0, _defineProperty2.default)(target, key, source[key]);}) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {_Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key));});}return target;}

// 256k is default GridFS chunk size, but performs terribly for largish files
const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 2;

class GridFSStore extends _fileCollectionsSaBase.default {
  constructor({
    chunkSize = DEFAULT_CHUNK_SIZE,
    collectionPrefix = "fc_sa_gridfs.",
    db,
    fileKeyMaker,
    mongodb,
    name,
    transformRead,
    transformWrite } =
  {}) {
    super({
      fileKeyMaker,
      name,
      transformRead,
      transformWrite });(0, _defineProperty2.default)(this, "typeName",

























































































    "gridfs");this.chunkSize = chunkSize;this.collectionName = `${collectionPrefix}${name}`.trim();this.grid = (0, _gridfsStream.default)(db, mongodb);this.mongodb = mongodb;}_fileKeyMaker(fileRecord) {const info = fileRecord.infoForCopy(this.name);const result = { _id: info.key || null, filename: info.name || fileRecord.name() || `${fileRecord.collectionName}-${fileRecord._id}` };(0, _debug.default)("GridFSStore _fileKeyMaker result:", result);return result;}_getReadStream(fileKey, { start: startPos, end: endPos } = {}) {const opts = { _id: fileKey._id, root: this.collectionName }; // Add range if this should be a partial read
    if (typeof startPos === "number" && typeof endPos === "number") {opts.range = { startPos, endPos };}(0, _debug.default)("GridFSStore _getReadStream opts:", opts);return this.grid.createReadStream(opts);}_getWriteStream(fileKey, options = {}) {const opts = _objectSpread({ chunk_size: this.chunkSize, // eslint-disable-line camelcase
      content_type: "application/octet-stream", // eslint-disable-line camelcase
      filename: fileKey.filename, mode: "w", // overwrite any existing data
      root: this.collectionName }, options);if (fileKey._id) opts._id = fileKey._id;(0, _debug.default)("GridFSStore _getWriteStream opts:", opts);const writeStream = this.grid.createWriteStream(opts);writeStream.on("close", (file) => {if (!file) {// gridfs-stream will emit "close" without passing a file
        // if there is an error. We can simply exit here because
        // the "error" listener will also be called in this case.
        return;} // Emit end and return the fileKey, size, and updated date
      writeStream.emit("stored", { // Set the generated _id so that we know it for future reads and writes.
        // We store the _id as a string and only convert to ObjectID right before
        // reading, writing, or deleting.
        fileKey: file._id.toString(), size: file.length, storedAt: file.uploadDate || new Date() });});return writeStream;}_removeFile(fileKey) {(0, _debug.default)("GridFSStore _removeFile called for fileKey", fileKey);if (!fileKey._id) return _promise.default.resolve();return new _promise.default((resolve, reject) => {this.grid.remove({ _id: fileKey._id, root: this.collectionName }, (error, result) => {if (error) {reject(error);} else {resolve(result);}});});}}exports.default = GridFSStore;