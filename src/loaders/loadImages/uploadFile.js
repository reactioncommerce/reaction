import fs from "fs";
import { Blob } from "buffer";
import { Readable } from "stream";
import Logger from "@reactioncommerce/logger";
import pkg from "@reactioncommerce/file-collections";

global.Blob = Blob;

const { FileRecord } = pkg;

/**
 * @summary load product images from disk to GridFS
 * @param {Object} context - The application context
 * @returns {Promise<Boolean>} true is successful
 */
export default async function uploadImages(context) {
  const { collections: { Media } } = context;
  const data = fs.readFileSync("./custom-packages/sample-data/src/images/fatbear.jpg");
  const blob = new Blob([data], { type: "image/jpg" });
  const fileRecord = new FileRecord(blob);
  fileRecord.name("fatbear.jpg");
  await Media.insert(fileRecord);

  const writeStream = await Media.stores[0].createWriteStream(fileRecord);
  await new Promise((resolve, reject) => {
    writeStream.once("error", (err) => err && reject(err));
    writeStream.once("stored", resolve);
    Readable.from(data).pipe(writeStream);
  });
  Logger.info("done uploading images");
}
