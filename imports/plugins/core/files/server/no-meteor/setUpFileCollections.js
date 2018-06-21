import Random from "@reactioncommerce/random";
import sharp from "sharp";
import {
  FileDownloadManager,
  FileRecord,
  MongoFileCollection,
  TempFileStore
} from "@reactioncommerce/file-collections";
import GridFSStore from "@reactioncommerce/file-collections-sa-gridfs";

export default function setUpFileCollections({
  absoluteUrlPrefix,
  db,
  Logger,
  MediaRecords,
  mongodb
}) {
  FileRecord.downloadEndpointPrefix = "/assets/files";
  FileRecord.absoluteUrlPrefix = absoluteUrlPrefix;

  // 1024*1024*2 is the GridFSStore default chunk size, and 256k is default GridFS chunk size, but performs terribly
  const gridFSStoresChunkSize = 1 * 1024 * 1024;

  /**
   * Image files are resized to 4 different sizes:
   * 1. `large` - 1000px by 1000px - preserves aspect ratio
   * 2. `medium` - 600px by 600px - preserves aspect ratio
   * 3. `small` - 235px by 235px - crops to square - creates png version
   * 4. `thumbnail` - 100px by 100px - crops to square - creates png version
   * @name imgTransforms
   * @memberof Files
   * @constant {Array}
   * @property {string} name - transform name that will be used as GridFS name
   * @property {object|undefined} transform - object with image transform settings
   * @property {number} size - transform size, only one number needed for both width & height
   * @property {string} mod - transform modifier function call,
   *   for example the `large` & `medium` image transforms want to preserve
   *   the image's aspect ratio and resize based on the larger width or height
   *   so we use the `max` Sharp modifier function.
   *   Check out the {@link http://sharp.pixelplumbing.com/en/stable/|Sharp Docs} for more helper functions.
   *   {@link http://sharp.pixelplumbing.com/en/stable/api-resize/#max|Sharp max()}
   *   {@link http://sharp.pixelplumbing.com/en/stable/api-resize/#crop|Sharp crop()}
   * @property {string} format - output image format
   * @summary Defines all image transforms
   * @ignore
   */
  const imgTransforms = [
    { name: "image", transform: { size: 1600, mod: "max", format: "jpg", type: "image/jpeg" } },
    { name: "large", transform: { size: 1000, mod: "max", format: "jpg", type: "image/jpeg" } },
    { name: "medium", transform: { size: 600, mod: "max", format: "jpg", type: "image/jpeg" } },
    { name: "small", transform: { size: 235, mod: "crop", format: "png", type: "image/png" } },
    { name: "thumbnail", transform: { size: 100, mod: "crop", format: "png", type: "image/png" } }
  ];

  /**
   * @name buildGFS
   * @method
   * @memberof Files
   * @param {object} imgTransform
   * @summary buildGFS returns a fresh GridFSStore instance from provided image transform settings.
   */
  const buildGFS = ({ name, transform }) => (
    new GridFSStore({
      chunkSize: gridFSStoresChunkSize,
      collectionPrefix: "cfs_gridfs.",
      db,
      mongodb,
      name,
      async transformWrite(fileRecord) {
        if (!transform) return;

        const { size, mod, format, type } = transform;

        // Need to update the content type and extension of the file info, too.
        // The new size gets set correctly automatically by FileCollections package.
        fileRecord.type(type, { store: name });
        fileRecord.extension(format, { store: name });

        // resizing image, adding mod, setting output format
        return sharp().resize(size, size)[mod]().toFormat(format);
      }
    })
  );

  /**
   * @name stores
   * @memberof Files
   * @constant {Array}
   * @summary Defines an array of GridFSStore by mapping the imgTransform settings over the buildGFS function
   */
  const stores = imgTransforms.map(buildGFS);

  /**
   * @name tempStore
   * @type TempFileStore
   * @memberof Files
   * @summary Defines the temporary store where chunked uploads from browsers go
   * initially, until the chunks are eventually combined into one complete file
   * which the worker will then store to the permanant stores.
   * @see {@link https://github.com/reactioncommerce/reaction-file-collections}
   */
  const tempStore = new TempFileStore({
    shouldAllowRequest(req) {
      const { type } = req.uploadMetadata;
      if (typeof type !== "string" || !type.startsWith("image/")) {
        Logger.info(`shouldAllowRequest received request to upload file of type "${type}" and denied it`);
        return false;
      }
      return true;
    }
  });

  /**
   * @name Media
   * @type MongoFileCollection
   * @memberof Files
   * @summary Defines the Media FileCollection
   * To learn how to further manipulate images with Sharp, refer to
   * {@link http://sharp.pixelplumbing.com/en/stable/|Sharp Docs}
   * @see https://github.com/reactioncommerce/reaction-file-collections
   */
  const Media = new MongoFileCollection("Media", {
    allowGet: () => true, // add more security here if the files should not be public
    collection: MediaRecords,
    makeNewStringID: () => Random.id(),
    stores,
    tempStore
  });

  /**
   * @name downloadManager
   * @type FileDownloadManager
   * @memberof Files
   * @summary Set up a URL for downloading the files
   * @see https://github.com/reactioncommerce/reaction-file-collections
   */
  const downloadManager = new FileDownloadManager({
    collections: [Media],
    headers: {
      get: {
        "Cache-Control": "public, max-age=31536000"
      }
    }
  });

  return {
    downloadManager,
    Media,
    stores,
    tempStore
  };
}
