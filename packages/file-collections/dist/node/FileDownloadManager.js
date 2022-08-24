"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");_Object$defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));var _debug = _interopRequireDefault(require("./debug"));
var _getFileDownloadHandler = _interopRequireDefault(require("./getFileDownloadHandler"));

class FileDownloadManager {
  constructor({
    collections,
    headers } =
  {}) {
    if (!(0, _isArray.default)(collections) || collections.length === 0) {
      throw new Error("FileDownloadManager constructor requires collections array");
    }

    // They must be FileCollections
    const collectionsByName = {};
    collections.forEach((collection) => {
      collectionsByName[collection.name] = collection;
    });

    this.collectionsByName = collectionsByName;
    this.headers = headers;

    const handler = (0, _getFileDownloadHandler.default)({
      // Should return null if collection name or file ID are invalid
      // Otherwise should return info object, could be empty
      async getFileInfo({
        collectionName,
        context,
        fileId,
        storeName })
      {
        const collection = collectionsByName[collectionName];
        if (!collection) {
          (0, _debug.default)(`"${collectionName}" collection is not in the collections list!`);
          return null;
        }

        const fileRecord = await collection.findOne(fileId);
        if (!fileRecord) {
          (0, _debug.default)(`"${collectionName}" collection does not contain a document with ID "${fileId}"!`);
          return null;
        }

        context.storeName = storeName;
        context.collection = collection;
        context.fileRecord = fileRecord;

        return fileRecord.infoForCopy(context.storeName);
      },
      async getReadStream(context, { start, end } = {}) {
        const { collection, fileRecord, storeName } = context;
        return collection.getStore(storeName).createReadStream(fileRecord, { start, end });
      },
      headers,
      shouldAllowGet(context, req) {
        const { collection, fileRecord, storeName } = context;
        return collection.shouldAllowGet(fileRecord, req, storeName);
      } });


    // Add some error handling since getFileDownloadHandler returns a Promise
    this.connectHandler = (req, res) => {
      handler(req, res).catch((error) => {
        console.error(error); // eslint-disable-line no-console
        res.writeHead(500, "Internal Server Error");
        res.end();
      });
    };
  }}exports.default = FileDownloadManager;