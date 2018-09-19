import { Readable } from "stream";
import csv from "csv";
import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { FileRecord } from "@reactioncommerce/file-collections";
import { getConvMapByCollection } from "../../lib/common/conversionMaps";
import { JobItems, Mappings } from "../collections";
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
 * @param {Boolean} shouldUpdate - to update docs? false if docs are to be created
 * @return {Array} - errors on the item
 */
function validateItem(item, fields, shouldUpdate) {
  const errors = [];
  fields.forEach((field) => {
    if (!field.optional) {
      if ((shouldUpdate && (field.key in item) && !item[field.key]) || (!shouldUpdate && !item[field.key])) {
        errors.push(`${field.label} is required.`);
      }
    }
  });
  return errors;
}

/**
 * @name convertFieldValue
 * @summary Converts a field value depending on its type
 * @param {String} value - the value to be converted
 * @param {Object} fieldSpec - field spec from ConversionMaps
 * @return {String} - converted value
 */
function convertFieldValue(value, fieldSpec) {
  if (fieldSpec.type === Boolean) {
    const falseValues = ["0", "false"];
    if (falseValues.includes(value.toLowerCase())) {
      return false;
    }
    return true;
  } else if (fieldSpec.type === Array) {
    return value.split(" || ");
  } else if (fieldSpec.type === Number) {
    return Number(value);
  }
  return value;
}

/**
 * @name parseRawObjects
 * @summary Parses data using mapping from conversion map
 * @param {Array} data - the data to be parsed
 * @param {Object} mapping - mapping from the job item
 * @param {Object} convMap - the conversion map to be used
 * @param {Object} options - returned from pre import callback
 * @param {Boolean} shouldUpdate - to update docs? false if docs are to be created
 * @return {Object} - consists of valid data to be saved to database and data with errors
 */
async function parseRawObjects(data, mapping, convMap, options, shouldUpdate = false) {
  const {
    fields,
    importConversionInsertCallback,
    importConversionUpdateCallback
  } = convMap;
  const validData = [];
  const withErrorData = [];

  for (let i = 0; i < data.length; i += 1) {
    const originalRow = data[i];
    const row = {
      rowNumber: i,
      originalRow
    };
    const cleanRow = {};
    for (const field in originalRow) {
      if ({}.hasOwnProperty.call(originalRow, field) && mapping[field] !== "ignore") {
        cleanRow[mapping[field]] = originalRow[field];
      }
    }

    const errors = validateItem(cleanRow, convMap.fields, shouldUpdate);
    if (errors.length > 0) {
      row.errors = errors;
      row.saved = false;
      withErrorData.push(row);
      continue;
    }

    const convertedRow = {}; // generic conversion, strings to boolean, strings to array, etc
    for (const fieldToConvert in cleanRow) {
      if ({}.hasOwnProperty.call(cleanRow, fieldToConvert) && fieldToConvert !== "rowNumber") {
        const fieldSpec = fields.find((field) => field.key === fieldToConvert);
        convertedRow[fieldToConvert] = convertFieldValue(cleanRow[fieldToConvert], fieldSpec);
      }
    }

    let collectionConversionResult; // collection-specific conversion, i.e. tag slugs should be converted to tag ids for products
    if (shouldUpdate && typeof importConversionUpdateCallback === "function") {
      collectionConversionResult = importConversionUpdateCallback(convertedRow, options);
    } else if (typeof importConversionInsertCallback === "function") {
      collectionConversionResult = importConversionInsertCallback(convertedRow, options);
    }

    if (collectionConversionResult.errors && collectionConversionResult.errors.length > 0) {
      row.errors = collectionConversionResult.errors;
      row.saved = false;
      withErrorData.push(row);
      continue;
    } else {
      Object.assign(convertedRow, collectionConversionResult.item);
    }

    row.convertedRow = convertedRow;
    validData.push(row);
  }
  return { validData, withErrorData };
}

/**
 * @name prepareDataChunkForUpdate
 * @summary Converts each object into filter, update form
 * @param {Array} data - array of objects to be saved to database
 * @return {Array} - array of objects for querying
 */
function prepareDataChunkForUpdate(data) {
  return data.map((item) => {
    const result = {};
    result.filter = { _id: item._id };
    result.update = { $set: _.omit(item, ["_id"]) };
    return { updateOne: result };
  });
}

/**
 * @name getNonExistingIds
 * @summary Get non existing IDs from data array read from file
 * @param {Array} data - data to be cleaned
 * @param {Object} rawCollection - raw collection where
 * @return {Array} - array of ids that are not existing in current database
 */
async function getNonExistingIds(data, rawCollection) {
  const ids = data.map((row) => row.convertedRow._id);
  const existingIdsDocs = await rawCollection.find({ _id: { $in: ids } }, { _id: 1 }).toArray();
  const existingIds = existingIdsDocs.map((doc) => doc._id);
  return _.difference(ids, existingIds);
}


/**
 * @name saveWithErrorData
 * @summary Saves with error data into a file into the database
 * @param {Array} withErrorData - data consiting of row number, error messages, and original row
 * @param {Object} jobItem - job item doc
 * @param {Boolean} shouldUpdate - to update docs? false if docs are to be created
 * @return {Promise} - resolving to database updates
 */
async function saveWithErrorData(withErrorData, jobItem, shouldUpdate = false) {
  const { hasHeader, _id: jobItemId } = jobItem;
  if (withErrorData.length > 0) {
    const csvErrorRows = [];
    let header = ["Row Number", "Saved?", "Errors"];
    if (shouldUpdate) {
      header = ["Row Number", "Errors"];
    }
    csvErrorRows.push(header.concat(Object.keys(withErrorData[0].originalRow)));
    withErrorData.forEach((row) => {
      const originalRowNumber = hasHeader ? row.rowNumber + 2 : row.rowNumber + 1;
      const errorMessages = row.errors.join(" || ");
      const originalValues = Object.values(row.originalRow);
      if (shouldUpdate) {
        csvErrorRows.push([originalRowNumber, errorMessages].concat(originalValues));
      } else {
        const saved = row.saved ? "Yes" : "No";
        csvErrorRows.push([originalRowNumber, saved, errorMessages].concat(originalValues));
      }
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
 * @name saveImportDataUpdates
 * @summary Updates existing data in database
 * @param {Object} jobItem - job item document
 * @param {Array} data - array of objects to be saved to database
 * @return {Promise} - to save with error data
 */
async function saveImportDataUpdates(jobItem, data) {
  const { collection, mapping } = jobItem;
  const shouldUpdate = true;

  const convMap = getConvMapByCollection(collection);
  const {
    fields,
    preImportUpdateCallback,
    postImportUpdateCallback,
    rawCollection
  } = convMap;
  const keysToDelete = fields.filter((field) => field.ignoreOnSave);

  let options = {};
  if (typeof preImportUpdateCallback === "function") {
    options = await preImportUpdateCallback(data);
  }

  const { validData, withErrorData } = await parseRawObjects(data, mapping, convMap, options, shouldUpdate);

  const dataChunks = _.chunk(validData, 1000);

  await Promise.all(dataChunks.map(async (dataChunk) => {
    const idsToRemove = await getNonExistingIds(dataChunk, rawCollection);
    const validDataChunk = [];
    dataChunk.forEach((row) => {
      if (!idsToRemove.includes(row.convertedRow._id)) {
        validDataChunk.push(row);
      } else {
        row.errors = ["ID not found."];
        withErrorData.push(row);
      }
    });

    const toSaveData = validDataChunk.map((row) => {
      const docClone = Object.assign({}, row.convertedRow);
      keysToDelete.forEach((field) => {
        delete docClone[field.key];
      });
      return docClone;
    });

    const updateArray = prepareDataChunkForUpdate(toSaveData);
    await rawCollection.bulkWrite(updateArray);

    if (typeof postImportUpdateCallback === "function") {
      for (const row of validDataChunk) {
        const errors = await postImportUpdateCallback(row.convertedRow, options); // eslint-disable-line no-await-in-loop
        if (errors && errors.length > 0) {
          row.errors = errors;
          withErrorData.push(row);
        }
      }
    }
  }));

  return saveWithErrorData(withErrorData, jobItem, shouldUpdate);
}

/**
 * @name saveImportDataInserts
 * @summary Inserts new data in database
 * @param {Object} jobItem - job item document
 * @param {Array} data - array of objects to be saved to database
 * @return {Promise} - to save with error data
 */
async function saveImportDataInserts(jobItem, data) {
  const { collection, mapping } = jobItem;

  const convMap = getConvMapByCollection(collection);
  const {
    fields,
    preImportInsertCallback,
    postImportInsertCallback,
    rawCollection
  } = convMap;
  const keysToDelete = fields.filter((field) => field.ignoreOnSave);

  let options = {};
  if (typeof preImportInsertCallback === "function") {
    options = await preImportInsertCallback(data);
  }

  const { validData, withErrorData } = await parseRawObjects(data, mapping, convMap, options);

  const dataChunks = _.chunk(validData, 1000);

  await Promise.all(dataChunks.map(async (dataChunk) => {
    const toSaveData = dataChunk.map((row) => {
      const docClone = Object.assign({}, row.convertedRow);
      keysToDelete.forEach((field) => {
        delete docClone[field.key];
      });
      return docClone;
    });

    await rawCollection.insertMany(toSaveData);

    if (typeof postImportInsertCallback === "function") {
      for (const row of validData) {
        const errors = await postImportInsertCallback(row.convertedRow, options); // eslint-disable-line no-await-in-loop
        if (errors && errors.length > 0) {
          row.errors = errors;
          withErrorData.push(row);
        }
      }
    }
  }));

  return saveWithErrorData(withErrorData, jobItem);
}


/**
 * @name saveImportData
 * @summary Saves import data into database
 * @param {Object} jobItem - job item document
 * @param {Array} data - array of objects to be saved to database
 * @return {Promise} - resolving to database updates or inserts
 */
async function saveImportData(jobItem, data) {
  const { mapping } = jobItem;

  let shouldUpdate = false;

  const invertedMapping = _.invert(mapping);
  if ("_id" in invertedMapping && invertedMapping._id in data[0]) {
    shouldUpdate = true;
  }

  if (shouldUpdate) {
    return saveImportDataUpdates(jobItem, data);
  }
  return saveImportDataInserts(jobItem, data);
}

/**
 *
 * @name exportDataToCSV
 * @summary Creates file record for exported data
 * @param {Object} jobItem - job item document
 * @return {Promise} - Promise
 */
async function exportDataToCSV(jobItem) {
  const { _id: jobItemId, collection, mappingId } = jobItem;
  const convMap = getConvMapByCollection(collection);

  let headers;
  let orderedFieldsKeys;
  if (mappingId === "default") {
    headers = convMap.fields.map((field) => field.label);
    orderedFieldsKeys = convMap.fields.map((field) => field.key);
  } else {
    const mappingDoc = await Mappings.findOne({ _id: mappingId });
    const mapping = _.omitBy(mappingDoc.mapping, (value) => value === "ignore");
    const invertedMapping = _.invert(mapping);
    const headerKeys = _.values(mapping);
    const orderedFields = convMap.fields.filter((field) => (headerKeys.includes(field.key)));
    orderedFieldsKeys = orderedFields.map((field) => field.key);
    headers = orderedFields.map((field) => invertedMapping[field.key]);
  }

  const docs = await convMap.rawCollection.find({ isDeleted: false }).toArray();
  const rows = await Promise.all(docs.map((doc) => convMap.exportConversionCallback(doc, orderedFieldsKeys)));
  rows.unshift(headers);
  csv.stringify(rows, async (error, csvString) => {
    const exportFileDoc = {
      original: {
        name: `${jobItemId}.csv`,
        type: "text/csv",
        size: csvString.length,
        updatedAt: new Date()
      }
    };
    const fileRecord = new FileRecord(exportFileDoc);
    fileRecord.metadata = { jobItemId, type: "export" };
    const readStream = new Readable();
    readStream.push(csvString);
    readStream.push(null);
    const store = NoMeteorJobFiles.getStore("jobFiles");
    const writeStream = await store.createWriteStream(fileRecord);
    readStream.pipe(writeStream);
    const exportFile = await NoMeteorJobFiles.insert(fileRecord, { raw: true });
    JobItems.update({ _id: jobItemId }, { $set: { exportFileId: exportFile._id } });
  });
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

  if (jobType === "import") {
    let csvRows;
    try {
      csvRows = await getCSVRowsFromSource(jobItem);
    } catch (error) {
      return JobItems.update({ _id: jobItemId }, { $set: { status: "fileRejected", completedAt: new Date() } });
    }
    if (csvRows) {
      await saveImportData(jobItem, csvRows);
    }
  } else {
    await exportDataToCSV(jobItem);
  }
  return JobItems.update({ _id: jobItemId }, { $set: { status: "completed", completedAt: new Date() } });
}
