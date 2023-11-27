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
    this.grid = new mongodb.GridFSBucket(db);
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
    const opts = {};

    // Add range if this should be a partial read
    if (typeof startPos === "number" && typeof endPos === "number") {
      opts.start = startPos;
      opts.end = endPos + 1;
    }

    debug("GridFSStore _getReadStream opts:", opts);

    const _id = new this.mongodb.ObjectId(fileKey._id);
    return this.grid.openDownloadStream(_id, opts);
  }

  _getWriteStream(fileKey, options = {}) {
    const opts = {
      chunkSizeBytes: this.chunkSize,
      contentType: "application/octet-stream",
      ...options
    };

    debug("GridFSStore _getWriteStream opts:", opts);

    const writeStream = this.grid.openUploadStream(fileKey.filename, opts);

    writeStream.on("finish", (file) => {
      if (!file) {
        // gridfs will emit "finish" without passing a file
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
