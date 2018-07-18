import fs from "fs";
import csv from "csv";

/**
 * @summary TODO
 * @param {Object} filePath - TODO
 * @param {Object} delimiter - TODO
 * @returns {Object} the callback
 * @private
 */
export function readCSVFile(filePath, delimiter = ",") {
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
 * @param {Object} importFile - TODO
 * @param {Object} schema - TODO
 * @returns {Array} the callback
 * @private
 */
export async function processImportFile(importFile, importableSchema) {
  /*
  * importFile: {
  *   "type": "local",
  *   "local": {
  *     "location": "/var/data/products.csv"
  *   },
  *   "mapping": {
  *     "Name": "title",
  *     "_id": "_id"
  *   }
  * }
  *
  * schema:
  *   [{
  *     key: "_id",
  *     required: false,
  *     type: string, number, array, array of objects, date
  *   },...]
  * } // this will only be useful for simple client validations
  */
  if (importFile.method === "local" && importFile.local.filePath) {
    try {
      const result = [];
      const delimiter = importFile.local.delimiter || ",";
      const csvRows = await readCSVFile(importFile.local.filePath, delimiter);
      // TODO: This is not always true. Consider importFile.hasHeader
      const header = csvRows[0];
      csvRows.splice(0, 1); // Remove the header
      if (csvRows) {
        for (const csvRow of csvRows) {
          let csvColIndex = 0;
          const doc = {};
          if (csvRow) {
            for (const val of csvRow) {
              doc[importFile.mapping[header[csvColIndex]]] = val;
              csvColIndex += 1;
            }
          }
          result.push(doc);
        }
      }
      return result;
    } catch (error) {
      return error;
    }
  }
  return [];
}
