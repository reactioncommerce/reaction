import fs from "fs";
import csv from "csv";

/** This will contain all importable collections registered in different Reaction plugins
 * Example value:
 * {
 *   "Products": {
 *     "label": "Products",
 *     "importSchema": [
 *       {
 *         "key": "id",
 *         "saveToField": "_id",
 *         "label": "ID"
 *       }
 *     ]
 *   },
 *   "Tags": {
 *      ...
 *   },
 *   "DsicountCodes": {
 *   }
 * }
 */

export const ImportableCollections = {};

/**
 * @summary TODO
 * @param {Object} impColl - TODO
 * @returns {undefined}
 * @private
 */
function validateImportableCollection(impColl) {
  if (typeof impColl.collection !== "string") {
    throw TypeError("An importable collection requires a collection.");
  }
  if (!impColl.importSchema || !impColl.importSchema.length || impColl.importSchema.length === 0) {
    throw TypeError("An importable collection requires an importSchema.");
  }
  impColl.importSchema.forEach((field) => {
    if (typeof field.key !== "string") {
      throw TypeError("Key is required for an importSchema field.");
    }
    if (typeof field.label !== "string") {
      throw TypeError("Label is required for an importSchema field.");
    }
    if (typeof field.saveToField !== "string") {
      throw TypeError("saveToField is required for an importSchema field.");
    }
  });
  return true;
}

/**
 * @summary TODO
 * @param {Object} impColl - TODO
 * @returns {boolean} TODO
 */
export function registerImportableCollection(impColl) {
  try {
    validateImportableCollection(impColl);
  } catch (error) {
    throw error;
  }
  ImportableCollections[impColl.collection] = {
    importSchema: impColl.importSchema,
    label: impColl.label
  };
  return true;
}

/**
 * @summary TODO
 * @param {Object} filePath - TODO
 * @param {Object} delimiter - TODO
 * @returns {Object} the callback
 * @private
 */
export function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .on("data", (data) => {
        csv.parse(data, (error, csvRows) => {
          if (error) {
            reject(error);
          }
          resolve(csvRows);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * @summary TODO
 * @returns {Array} the callback
 */
export function getImportableCollectionsOptions() {
  const options = [];
  for (const coll in ImportableCollections) {
    if (ImportableCollections[coll]) {
      options.push({
        label: ImportableCollections[coll].label,
        value: coll
      });
    }
  }
  return options;
}

/**
 * @summary TODO
 * @returns {Array} the callback
 */
export function getFieldOptionsForCollection(collection) {
  let options = [{
    label: "Ignore",
    value: "ignore"
  }];
  const fieldOptions = ImportableCollections[collection].importSchema.map((field) => ({ label: field.label, value: field.key }));
  options = options.concat(fieldOptions);
  return options;
}

/**
 * @summary Get default mapping for a given collection
 * @param {String} collection collection name
 * @returns {Object} just a mapping of field key to field label
 */
export function getDefaultMappingForCollection(collection) {
  const mapping = {};
  if (ImportableCollections[collection] && ImportableCollections[collection].importSchema) {
    for (const field of ImportableCollections[collection].importSchema) {
      mapping[field.label] = field.key;
    }
  }
  return mapping;
}


/**
 * @summary TODO
 * @param {String} item - TODO
 * @returns {String} item - the callback
 */
export function itemOrEmptyString(item) {
  return item || item === 0 ? item : "";
}

export function arrayToCSVRow(arrayRow) {
  const csvRow = arrayRow.map((item) => `"${itemOrEmptyString(item)}"`);
  return `${csvRow.join(",")}\r\n`;
}

export function getDefaultCSVFileHeader(collection) {
  let headers = [];
  const desiredImpColl = ImportableCollections[collection];
  if (desiredImpColl) {
    headers = desiredImpColl.importSchema.map((field) => field.label);
  }
  return arrayToCSVRow(headers);
}
