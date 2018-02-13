import Grid from "gridfs-stream";
import StorageAdapter from "@reactioncommerce/file-collections-sa-base";
import debug from "./debug";

// 256k is default GridFS chunk size, but performs terribly for largish files
const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 2;

export default class GridFSStore extends StorageAdapter {
  constructor({
    chunkSize = DEFAULT_CHUNK_SIZE,
    collectionPrefix = "fc_sa_gridfs.",
    db,
    fileKeyMaker,
    mongodb,
    name,
    transformRead,
    transformWrite
  } = {}) {
    super({
      fileKeyMaker,
      name,
      transformRead,
      transformWrite
    });

    this.chunkSize = chunkSize;
    this.collectionName = `${collectionPrefix}${name}`.trim();
    this.grid = Grid(db, mongodb);
    this.mongodb = mongodb;
  }

  _fileKeyMaker(fileRecord) {
    const info = fileRecord.infoForCopy(this.name);
    const result = {
      _id: info.key || null,
      filename: info.name || fileRecord.name() || `${fileRecord.collectionName}-${fileRecord._id}`
    };

    debug("GridFSStore _fileKeyMaker result:", result);

    return result;
  }

  _getReadStream(fileKey, { start: startPos, end: endPos } = {}) {
    const opts = { _id: fileKey._id, root: this.collectionName };

    // Add range if this should be a partial read
    if (typeof startPos === "number" && typeof endPos === "number") {
      opts.range = { startPos, endPos };
    }

    debug("GridFSStore _getReadStream opts:", opts);

    return this.grid.createReadStream(opts);
  }

  _getWriteStream(fileKey, options = {}) {
    const opts = {
      chunk_size: this.chunkSize, // eslint-disable-line camelcase
      content_type: "application/octet-stream", // eslint-disable-line camelcase
      filename: fileKey.filename,
      mode: "w", // overwrite any existing data
      root: this.collectionName,
      ...options
    };

    if (fileKey._id) opts._id = fileKey._id;

    debug("GridFSStore _getWriteStream opts:", opts);

    const writeStream = this.grid.createWriteStream(opts);

    writeStream.on("close", (file) => {
      if (!file) {
        // gridfs-stream will emit "close" without passing a file
        // if there is an error. We can simply exit here because
        // the "error" listener will also be called in this case.
        return;
      }

      // Emit end and return the fileKey, size, and updated date
      writeStream.emit("stored", {
        // Set the generated _id so that we know it for future reads and writes.
        // We store the _id as a string and only convert to ObjectID right before
        // reading, writing, or deleting.
        fileKey: file._id.toString(),
        size: file.length,
        storedAt: file.uploadDate || new Date()
      });
    });

    return writeStream;
  }

  _removeFile(fileKey) {
    debug("GridFSStore _removeFile called for fileKey", fileKey);
    if (!fileKey._id) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.grid.remove({
        _id: fileKey._id,
        root: this.collectionName
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  typeName = "gridfs";
}
