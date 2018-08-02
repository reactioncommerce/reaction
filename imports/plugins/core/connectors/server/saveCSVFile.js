import { Readable } from "stream";
import { FileRecord } from "@reactioncommerce/file-collections";
import { ImportFiles } from "/imports/plugins/core/connectors/server";

export default async function saveCSVFile(csvString, options) {
  const { importJob } = options;
  const doc = {
    original: {
      name: `${importJob._id}.csv`,
      type: "text/csv",
      size: csvString.length,
      updatedAt: new Date()
    }
  };
  const fileRecord = new FileRecord(doc);
  fileRecord.metadata = { importJobId: importJob._id, type: "errors" };
  const readStream = new Readable();
  readStream.push(csvString);
  readStream.push(null);
  const store = ImportFiles.getStore("importFiles");
  const writeStream = await store.createWriteStream(fileRecord);
  readStream.pipe(writeStream);
  ImportFiles.insert(fileRecord, { raw: true });
}
