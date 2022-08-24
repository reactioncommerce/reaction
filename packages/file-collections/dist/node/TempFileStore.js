"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");_Object$defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));var _events = require("events");
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _tusNodeServer = _interopRequireDefault(require("tus-node-server"));
var _debug = _interopRequireDefault(require("./debug")); // Built-in Node package
// Built-in Node package
/**
 * @param {Object} req Request to add meta data to
 * @returns {void} null
 */
function addUploadMetadataToRequest(req) {
  const metadataObj = {};
  (req.headers["upload-metadata"] || "").split(",").forEach((piece) => {
    const keyValue = piece.split(" ");
    const [key, value] = keyValue;
    if (typeof key === "string" && typeof value === "string") {
      metadataObj[key] = Buffer.from(value, "base64").toString();
      const valAsNumber = Number(metadataObj[key]);
      if (!isNaN(valAsNumber)) {
        metadataObj[key] = valAsNumber;
      }
    }
  });
  req.uploadMetadata = metadataObj;
}

class TempFileStore extends _events.EventEmitter {
  constructor({
    maxFileSize = 1024 * 1024 * 20,
    osFilePath = "uploads",
    shouldAllowRequest = () => false } =
  {}) {
    super();(0, _defineProperty2.default)(this, "connectHandler",





















    async (req, res) => {
      // We do not need to check any PATCH because they will fail anyway if the caller
      // does not have a correct generated file ID.
      if (req.method.toLowerCase() === "post") {
        let allowed;
        try {
          addUploadMetadataToRequest(req);
          allowed = await this.shouldAllowRequest(req);
          (0, _debug.default)(`shouldAllowRequest returned ${allowed}`);
        } catch (error) {
          (0, _debug.default)("shouldAllowRequest threw an error", error);
          allowed = false;
        }

        if (!allowed) {
          res.writeHead(403, "Forbidden");
          res.end();
          return;
        }
      }

      this.uploadServer.handle.bind(this.uploadServer)(req, res);
    });this.shouldAllowRequest = shouldAllowRequest;this.osFilePath = osFilePath; // Need to ensure there is an initial `/` or TUS generates a bad URL.
    // But for our own usage in this class, we must not have `/`
    let tusPath = osFilePath;if (!tusPath.startsWith("/")) tusPath = `/${tusPath}`;this.osFilePath = osFilePath;if (this.osFilePath.startsWith("/")) this.osFilePath = this.osFilePath.slice(1);this.uploadServer = new _tusNodeServer.default.Server();this.uploadServer.datastore = new _tusNodeServer.default.FileStore({ maxFileSize, path: tusPath });}createReadStream(tempFileId) {const filePath = _path.default.join(this.osFilePath, tempFileId);return _fs.default.createReadStream(filePath);}deleteIfExists(tempFileId) {
    const filePath = _path.default.join(this.osFilePath, tempFileId);
    return new _promise.default((resolve, reject) => {
      try {
        _fs.default.unlink(filePath, resolve);
      } catch (error) {
        reject(error);
      }
    });
  }

  exists(tempFileId) {
    const filePath = _path.default.join(this.osFilePath, tempFileId);
    return new _promise.default((resolve, reject) => {
      try {
        _fs.default.access(filePath, _fs.default.constants.R_OK, (err) => {
          resolve(!err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }}exports.default = TempFileStore;