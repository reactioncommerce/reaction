import _ from "lodash";

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

/**
 * @name getDefaultMappingForCollection
 * @summary Get default mapping for a selected data type
 * @param {String} collection - value from getDataTypeOptions
 * @returns {Object} the mapping
 */
export function getDefaultMappingForCollection(collection) {
  const mapping = {};
  ConversionMaps[collection].fields.forEach((field) => {
    mapping[field.label] = field.key;
  });
  return { mapping };
}

/**
 * @name getFieldOptionsForCollection
 * @summary Gets fields from conversion map for fields matching in UI
 * @param {String} collection - value from getDataTypeOptions
 * @returns {Array} array of options
 */
export function getFieldOptionsForCollection(collection) {
  const fieldOptions = ConversionMaps[collection].fields.map((field) => ({ label: field.label, value: field.key }));
  fieldOptions.push({ label: "Ignore", value: "ignore" });
  return fieldOptions;
}

/**
 * @name getConvMapByCollection
 * @summary Gets conversion map given a collection name
 * @param {String} collection - collection name
 * @returns {Object} the conversion map
 */
export function getConvMapByCollection(collection) {
  const convMapKey = _.findKey(ConversionMaps, (convMap) => convMap.collection === collection);
  return ConversionMaps[convMapKey];
}
