import { Readable } from "stream";
import csv from "csv";
import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { FileRecord } from "@reactioncommerce/file-collections";
import { getConvMapByCollection } from "../../lib/common/conversionMaps";
import { JobItems } from "../collections";
import { NoMeteorJobFiles } from "../jobFileCollections";

/**
 * @name getCSVRowsFromSource
 * @summary Reads CSV file from source
 * @param {Object} jobItem - job item document to process
 * @return {Array} - CSV rows data
 */
async function getCSVRowsFromSource(jobItem) {
  const { fileSource, hasHeader, _id: jobItemId } = jobItem;

  let csvRows;

  if (fileSource === "manual") {
    const fileRecord = await NoMeteorJobFiles.findOne({
      "metadata.jobItemId": jobItemId,
      "metadata.type": "upload"
    });

    const readStream = await fileRecord.createReadStreamFromStore("jobFiles");

    const getCSVRows = new Promise((resolve, reject) => {
      readStream.on("data", (data) => {
        let columns = true;
        if (!hasHeader) {
          columns = (row) => row.map((item, index) => index);
        }
        csv.parse(data, { columns }, (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        });
      });
    });

    try {
      csvRows = await getCSVRows;
    } catch (error) {
      Logger.error(error);
    }
  }
  return csvRows;
}


/**
 * @name validateItem
 * @summary Validates an item with respect to conversion map fields
 * @param {Object} item - the item to be validated
 * @param {Object} fields - conversion map fields
 * @return {Array} - errors on the item
 */
function validateItem(item, fields) {
  const errors = [];
  for (const field in item) {
    if (item[field] !== undefined) {
      const value = item[field];
      const convMapField = fields.find(({ key }) => field === key);
      if (convMapField && !convMapField.optional && !value) {
        errors.push(`${field} is required.`);
      }
    }
  }
  return errors;
}


/**
 * @name parseRawObjects
 * @summary Parses data using mapping from conversion map
 * @param {Array} data - the data to be parsed
 * @param {Object} mapping - mapping from the job item
 * @param {Object} convMap - the conversion map to be used
 * @return {Object} - consists of valid data to be saved to database and data with errors
 */
async function parseRawObjects(data, mapping, convMap) {
  const options = await convMap.preSaveCallback();

  const validData = [];
  const withErrorData = [];

  for (let i = 0; i < data.length; i += 1) {
    const item = data[i];
    const newDoc = {};
    newDoc.rowNumber = i;
    for (const field in item) {
      if (mapping[field] !== "ignore") {
        newDoc[mapping[field]] = item[field];
      }
    }

    const errors = validateItem(newDoc, convMap.fields);
    if (errors.length > 0) {
      withErrorData.push({ rowNumber: i, errors });
      continue;
    }

    if (typeof convMap.conversionCallback === "function") {
      Object.assign(newDoc, convMap.conversionCallback(newDoc, options));
    }

    validData.push(newDoc);
  }
  return { validData, withErrorData };
}


/**
 *
 * @name saveImportData
 * @summary Saves import data into database
 * @param {Object} jobItem - job item document
 * @param {Array} data - array of objects to be saved to database
 * @return {Promise} - Promise
 */
async function saveImportData(jobItem, data) {
  const { collection, hasHeader, _id: jobItemId, mapping } = jobItem;
  const convMap = getConvMapByCollection(collection);
  const keysToDelete = convMap.fields.filter((field) => field.ignoreOnSave);
  const insertPromises = [];
  const { validData, withErrorData } = await parseRawObjects(data, mapping, convMap);
  const toSaveData = validData.map((doc) => {
    const docClone = Object.assign({}, doc);
    delete docClone.rowNumber;
    keysToDelete.forEach((field) => {
      delete docClone[field.key];
    });
    return docClone;
  });
  const dataChunks = _.chunk(toSaveData, 1000);
  dataChunks.forEach((dataChunk) => insertPromises.push(convMap.rawCollection.insertMany(dataChunk)));
  try {
    await Promise.all(insertPromises);
  } catch (error) {
    Logger.error(error);
  }

  for (const item of validData) {
    try {
      await convMap.postSaveCallback(item); // eslint-disable-line no-await-in-loop
    } catch (error) {
      withErrorData.push({
        rowNumber: item.rowNumber,
        errors: [error.message],
        saved: true
      });
    }
  }

  if (withErrorData.length > 0) {
    const csvErrorRows = [];
    csvErrorRows.push(["Row Number", "Saved?", "Errors"].concat(Object.keys(data[0])));
    withErrorData.forEach((item) => {
      const originalRowNumber = hasHeader ? item.rowNumber + 2 : item.rowNumber + 1;
      const saved = item.saved ? "Yes" : "No";
      const errorMessages = item.errors.join(" || ");
      const originalData = Object.values(data[item.rowNumber]);
      csvErrorRows.push([originalRowNumber, saved, errorMessages].concat(originalData));
    });

    csv.stringify(csvErrorRows, async (error, csvString) => {
      const errorFileDoc = {
        original: {
          name: `${jobItemId}.csv`,
          type: "text/csv",
          size: csvString.length,
          updatedAt: new Date()
        }
      };
      const fileRecord = new FileRecord(errorFileDoc);
      fileRecord.metadata = { jobItemId, type: "errors" };
      const readStream = new Readable();
      readStream.push(csvString);
      readStream.push(null);
      const store = NoMeteorJobFiles.getStore("jobFiles");
      const writeStream = await store.createWriteStream(fileRecord);
      readStream.pipe(writeStream);
      const errorFile = await NoMeteorJobFiles.insert(fileRecord, { raw: true });
      JobItems.update({ _id: jobItemId }, { $set: { errorFileId: errorFile._id } });
    });
  }
}


/**
 * @name processJobItem
 * @summary Processes an import or export job item
 * @param {String} jobItemId - job item ID
 * @return {Promise} - Promise
 */
export default async function processJobItem(jobItemId) {
  const jobItem = await JobItems.findOne({ _id: jobItemId, status: "pending" });
  const { jobType } = jobItem;

  // Update the status of the job item to in progress
  JobItems.update({ _id: jobItemId }, { $set: { status: "inProgress" } });

  let csvRows;
  if (jobType === "import") {
    try {
      csvRows = await getCSVRowsFromSource(jobItem);
    } catch (error) {
      return JobItems.update({ _id: jobItemId }, { $set: { status: "fileRejected", completedAt: new Date() } });
    }
    if (csvRows) {
      await saveImportData(jobItem, csvRows);
    }
  }
  JobItems.update({ _id: jobItemId }, { $set: { status: "completed", completedAt: new Date() } });
}
