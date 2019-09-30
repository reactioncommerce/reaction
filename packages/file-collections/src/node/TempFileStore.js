import { EventEmitter } from "events";
import fs from "fs"; // Built-in Node package
import path from "path"; // Built-in Node package
import tus from "tus-node-server";
import debug from "./debug";

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
      metadataObj[key] = (Buffer.from(value, "base64")).toString();
      const valAsNumber = Number(metadataObj[key]);
      if (!isNaN(valAsNumber)) {
        metadataObj[key] = valAsNumber;
      }
    }
  });
  req.uploadMetadata = metadataObj;
}

export default class TempFileStore extends EventEmitter {
  constructor({
    maxFileSize = 1024 * 1024 * 20,
    osFilePath = "uploads",
    shouldAllowRequest = () => false
  } = {}) {
    super();

    this.shouldAllowRequest = shouldAllowRequest;

    this.osFilePath = osFilePath;

    // Need to ensure there is an initial `/` or TUS generates a bad URL.
    // But for our own usage in this class, we must not have `/`
    let tusPath = osFilePath;
    if (!tusPath.startsWith("/")) tusPath = `/${tusPath}`;
    this.osFilePath = osFilePath;
    if (this.osFilePath.startsWith("/")) this.osFilePath = this.osFilePath.slice(1);

    this.uploadServer = new tus.Server();
    this.uploadServer.datastore = new tus.FileStore({ maxFileSize, path: tusPath });
  }

  createReadStream(tempFileId) {
    const filePath = path.join(this.osFilePath, tempFileId);
    return fs.createReadStream(filePath);
  }

  connectHandler = async (req, res) => {
    // We do not need to check any PATCH because they will fail anyway if the caller
    // does not have a correct generated file ID.
    if (req.method.toLowerCase() === "post") {
      let allowed;
      try {
        addUploadMetadataToRequest(req);
        allowed = await this.shouldAllowRequest(req);
        debug(`shouldAllowRequest returned ${allowed}`);
      } catch (error) {
        debug("shouldAllowRequest threw an error", error);
        allowed = false;
      }

      if (!allowed) {
        res.writeHead(403, "Forbidden");
        res.end();
        return;
      }
    }

    this.uploadServer.handle.bind(this.uploadServer)(req, res);
  };

  deleteIfExists(tempFileId) {
    const filePath = path.join(this.osFilePath, tempFileId);
    return new Promise((resolve, reject) => {
      try {
        fs.unlink(filePath, resolve);
      } catch (error) {
        reject(error);
      }
    });
  }

  exists(tempFileId) {
    const filePath = path.join(this.osFilePath, tempFileId);
    return new Promise((resolve, reject) => {
      try {
        fs.access(filePath, fs.constants.R_OK, (err) => {
          resolve(!err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
