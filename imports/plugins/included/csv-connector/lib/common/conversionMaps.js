/** This will contain all conversion maps registered in different Reaction plugins
 * A conversion map has shape like below:
 * collection - name of an existing MongoDB collection
 * label - label for the collection, used in data type selection in the UI
 */
export const ConversionMaps = {};

/**
 * @name validateConversionMap
 * @summary Validates the structure of a conversion map
 * @param {Object} convMap - TODO
 * @returns {undefined}
 * @private
 */
function validateConversionMap(convMap) {
  if (typeof convMap.collection !== "string") {
    throw TypeError("A conversion map requires a collection.");
  }
  if (typeof convMap.collection !== "string") {
    throw TypeError("A conversion map requires a label.");
  }
}

/**
 * @name registerConversionMap
 * @summary Adds a convMap to the object ConversionMaps
 * @param {String} key - an identidier for the conversion map
 * @param {Object} convMap - a conversion map object
 * @returns {undefined}
 */
export function registerConversionMap(key, convMap) {
  try {
    validateConversionMap(convMap);
  } catch (error) {
    throw error;
  }
  ConversionMaps[key] = convMap;
}

/**
 * @name getDataTypeOptions
 * @summary Get data type options for select component in UI
 * @returns {Array} array of options
 */
export function getDataTypeOptions() {
  const options = [];
  for (const coll in ConversionMaps) {
    if (ConversionMaps[coll]) {
      options.push({
        label: ConversionMaps[coll].label,
        value: coll
      });
    }
  }
  return options;
}
