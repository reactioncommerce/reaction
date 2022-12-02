import SimpleSchema from "simpl-schema";
import _ from "lodash";

const SingleConditionSchema = new SimpleSchema({
  "key": {
    type: String
  },
  "stringValue": {
    type: String,
    optional: true
  },
  "intValue": {
    type: SimpleSchema.Integer,
    optional: true
  },
  "floatValue": {
    type: Number,
    optional: true
  },
  "boolValue": {
    type: Boolean,
    optional: true
  },
  "dateValue": {
    type: Date,
    optional: true
  },
  "stringArrayValue": {
    type: Array,
    optional: true
  },
  "stringArrayValue.$": {
    type: String
  },
  "intArrayValue": {
    type: Array,
    optional: true
  },
  "intArrayValue.$": {
    type: SimpleSchema.Integer
  },
  "floatArrayValue": {
    type: Array,
    optional: true
  },
  "floatArrayValue.$": {
    type: Number
  },
  "relOper": {
    type: String,
    allowedValues: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "regex", "beginsWith", "endsWith"]
  },
  "logNOT": {
    type: Boolean,
    optional: true
  },
  "caseSensitive": {
    type: Boolean,
    optional: true
  }
});

const FilterOneLevelSchema = new SimpleSchema({
  "any": {
    type: Array,
    optional: true
  },
  "any.$": {
    type: SingleConditionSchema
  },
  "all": {
    type: Array,
    optional: true
  },
  "all.$": {
    type: SingleConditionSchema
  }
});

const FilterTwoLevelSchema = new SimpleSchema({
  "any": {
    type: Array,
    optional: true
  },
  "any.$": {
    type: FilterOneLevelSchema
  },
  "all": {
    type: Array,
    optional: true
  },
  "all.$": {
    type: FilterOneLevelSchema
  }
});

const FilterThreeLevelSchema = new SimpleSchema({
  "any": {
    type: Array,
    optional: true
  },
  "any.$": {
    type: FilterTwoLevelSchema
  },
  "all": {
    type: Array,
    optional: true
  },
  "all.$": {
    type: FilterTwoLevelSchema
  }
});


const validCombos = {
  "SimpleSchema.String": {
    relOper: ["eq", "ne", "in", "nin", "regex", "beginsWith", "endsWith"],
    typeOf: ["string"]
  },
  "SimpleSchema.Integer": {
    relOper: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"],
    typeOf: ["number"]
  },
  "SimpleSchema.Number": {
    relOper: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"],
    typeOf: ["number"]
  },
  "SimpleSchema.Array": {
    relOper: ["in", "nin", "eq", "ne"],
    typeOf: ["array"]
  },
  "SimpleSchema.Boolean": {
    relOper: ["eq", "ne"],
    typeOf: ["boolean"]
  },
  "SimpleSchema.Date": {
    relOper: ["eq", "ne", "gt", "gte", "lt", "lte"],
    typeOf: ["date"]
  }
};

const REL_OPS_KEYS = ["any", "all"];

const FIELD_KEYS = [
  "key", "stringValue", "boolValue", "intValue", "floatValue", "dateValue",
  "stringArrayValue", "intArrayValue", "floatArrayValue",
  "relOper", "caseSensitive", "logNOT"
];

const keyMap = {
  all: "$and",
  any: "$or"
};

/**
 * @name verifyAllFieldKeys
 * @method
 * @memberof GraphQL/Filter
 * @summary Verifies if the input array of keys are all field keys
 * @param {String[]} keys - array of key to be verified
 * @returns {Boolean} - verfication result
 */
function verifyAllFieldKeys(keys) {
  // verify all keys in input array are valid and present in FIELD_KEYS
  for (const key of keys) {
    if (!FIELD_KEYS.includes(key)) {
      return false;
    }
  }
  return true;
}

/**
 * @name verifyAllRelOpKeys
 * @method
 * @memberof GraphQL/Filter
 * @summary Verifies if the input array of keys are all Relational operator keys
 * @param {String[]} keys - array of key to be verified
 * @returns {Boolean} - verfication result
 */
function verifyAllRelOpKeys(keys) {
  // verify all keys in input array are valid and present in REL_OPS_KEYS
  for (const key of keys) {
    if (!REL_OPS_KEYS.includes(key)) {
      return false;
    }
  }
  return true;
}


/**
 * @name checkIfCompoundCondition
 * @method
 * @memberof GraphQL/Filter
 * @summary Checks if the input filter condition is a compound condition
 * @param {Object} filterQuery - condition object to be verified
 * @returns {Boolean} - verfication result
 */
function checkIfCompoundCondition(filterQuery) {
  const allKeys = Object.keys(filterQuery);
  if (!allKeys || allKeys.length === 0) {
    throw new Error("Filter condition must have at least one key");
  }

  if (allKeys.length > 1) { // compound condition will have only one key (all/any)
    return false;
  }

  const isTopLevelRelOpKeys = verifyAllRelOpKeys(allKeys); // verify if the key is a valid relational operator key
  if (!isTopLevelRelOpKeys) {
    return false;
  }

  const filterConditions = filterQuery[allKeys[0]]; // get the array of filter conditions for the relational operator
  if (!filterConditions || !Array.isArray(filterConditions) || filterConditions.length === 0) {
    throw new Error("Filter condition array must have at least one condition");
  }

  const conditionKeys = []; // collect all the keys in the next level of the filter condition
  for (const condition of filterConditions) {
    const keys = Object.keys(condition);
    conditionKeys.push(...keys);
  }

  const allAreRelOpKeys = verifyAllRelOpKeys(conditionKeys); // verify the next level is also relational operator keys
  if (!allAreRelOpKeys) {
    return false;
  }

  return true;
}


/**
 * @name collectAtomicFilters
 * @method
 * @memberof GraphQL/Filter
 * @summary Collects atomic filters from a filter query
 * @param {Object} filter - an object containing the filters to apply
 * @returns {Array} - array of atomic filters
 */
function collectAtomicFilters(filter) {
  const atomicFilters = [];
  if (!filter) return atomicFilters;

  const isCompoundCondition = checkIfCompoundCondition(filter);
  if (!isCompoundCondition) {
    const currKey = Object.keys(filter)[0];
    const filters = filter[currKey];
    for (const eachFilter of filters) {
      atomicFilters.push(eachFilter);
    }
    return atomicFilters;
  }

  for (const fqKey of Object.keys(filter)) {
    if (fqKey === "any" || fqKey === "all") {
      const fq = filter[fqKey];
      if (Array.isArray(fq)) {
        for (const fqItem of fq) {
          atomicFilters.push(...collectAtomicFilters(fqItem));
        }
      }
    }
  }
  return atomicFilters;
}

/**
 * @name collectCollectionFields
 * @method
 * @memberof GraphQL/Filter
 * @summary collects all the fields of the specific collection along with metadata
 * @param {Object} context - an object containing the per-request state
 * @param {String} collectionName - name of the collection
 * @returns {Object} - Object with each field as key and type as value
 */
function collectCollectionFields(context, collectionName) { // #TODO: Move this out as a common endpoint
  const currentSchema = context.simpleSchemas[collectionName];
  const mergedSchemaObject = currentSchema.mergedSchema();
  const allKeys = Object.keys(mergedSchemaObject);
  const returnFieldTypes = {};
  allKeys.forEach((element) => {
    const definitionObj = currentSchema.getDefinition(element);
    const definition = definitionObj.type[0].type;
    if (!SimpleSchema.isSimpleSchema(definition)) { // skip SimpleSchema definition names
      if (typeof definition === "function") {
        returnFieldTypes[element] = `SimpleSchema.${definition.name}`;
      } else {
        returnFieldTypes[element] = definition;
      }
    }
  });
  return returnFieldTypes;
}

/**
 * @name countInputValueFields
 * @method
 * @memberof GraphQL/Filter
 * @summary Counts the number of fields received with the input value
 * @param {Object} inputValue - input value object
 * @returns {Number} - number of fields in the input value
 */
function countInputValueFields(inputValue) {
  let count = 0;
  for (const key of Object.keys(inputValue)) {
    if (inputValue[key] !== null && inputValue[key] !== undefined) {
      count += 1;
    }
  }
  return count;
}

/**
 * @name validateConditions
 * @method
 * @memberof GraphQL/Filter
 * @summary Validates the Filter conditions
 * @param {Object} allConditions - array of conditions to validate
 * @param {Object} allCollectionFields - array of fields from collection with metadata
 * @returns {undefined}
 */
function validateConditions(allConditions, allCollectionFields) {
  for (const condition of allConditions) {
    const {
      key, stringValue, intValue, floatValue, boolValue, dateValue,
      stringArrayValue, intArrayValue, floatArrayValue, relOper
    } = condition; // logNOT, caseSensitive are optional
    const expectedValueType = allCollectionFields[key];

    const inputValuesObject = { stringValue, intValue, floatValue, boolValue, dateValue, stringArrayValue, intArrayValue, floatArrayValue };
    const inputValuesCount = countInputValueFields(inputValuesObject);
    if (inputValuesCount > 1) {
      throw new Error(`Only one value must be provided for the condition with key: ${key}`);
    }

    // if key not in list of collection fields, throw error
    if (!Object.keys(allCollectionFields).includes(key)) {
      throw new Error(`Invalid key: ${key}`);
    }

    // if expectedValueType does not match the type of value, throw error
    if (expectedValueType === "SimpleSchema.String" && stringValue === undefined && stringArrayValue === undefined) {
      throw new Error(`Key '${key}' expects either stringValue & stringArrayValue`);
    } else if (expectedValueType === "SimpleSchema.Integer" && intValue === undefined && intArrayValue === undefined) {
      throw new Error(`Key '${key}' expects either intValue & intArrayValue`);
    } else if (expectedValueType === "SimpleSchema.Number" && floatValue === undefined && floatArrayValue === undefined) {
      throw new Error(`Key '${key}' expects either floatValue & floatArrayValue`);
    } else if (expectedValueType === "SimpleSchema.Boolean" && boolValue === undefined) {
      throw new Error(`Key '${key}' expects boolValue`);
    } else if (expectedValueType === "SimpleSchema.Date" && dateValue === undefined) {
      throw new Error(`Key '${key}' expects dateValue`);
    } // array can be compared with any of the above types, skipping this check

    if (validCombos[expectedValueType].relOper.indexOf(relOper) === -1) {
      throw new Error(`Invalid relational operator '${relOper}' for : ${expectedValueType}`);
    }

    if (expectedValueType === "SimpleSchema.Array" && stringArrayValue?.length === 0 && intArrayValue?.length === 0 && floatArrayValue?.length === 0) {
      throw new Error("Array value cannot be empty");
    }
  }
}


/**
 * @name simpleConditionToQuery
 * @method
 * @memberof GraphQL/Filter
 * @summary Converts a simple condition to a MongoDB query
 * @param {Object} condition The condition to convert
 * @param {String} condition.key The key to convert
 * @param {String} condition.stringValue The value in String format
 * @param {Number} condition.intValue The value in Integer format
 * @param {Number} condition.floatValue The value in Integer format
 * @param {Boolean} condition.boolValue The value in Boolean format
 * @param {String} condition.dateValue The value in Date/String format
 * @param {String[]} [condition.stringArrayValue] The value in String Array format
 * @param {Number[]} [condition.intArrayValue] The value in Integer Array format
 * @param {Number[]} [condition.floatArrayValue] The value in Integer Array format
 * @param {String} condition.relOper The relational operator to use
 * @param {String} condition.logNOT Whether to negate the condition
 * @param {String} condition.caseSensitive Whether regex search is caseSensitive
 * @returns {Object} The MongoDB query
 */
function simpleConditionToQuery(condition) {
  const {
    key, stringValue, intValue, floatValue, boolValue, dateValue,
    stringArrayValue, intArrayValue, floatArrayValue,
    relOper, logNOT, caseSensitive
  } = condition;
  const query = {};
  const valueToUse = stringValue || intValue || floatValue || boolValue || dateValue ||
  stringArrayValue || intArrayValue || floatArrayValue;

  let tempQuery;
  switch (relOper) {
    case "eq":
      if (boolValue !== undefined) {
        tempQuery = { $eq: boolValue };
      } else {
        tempQuery = { $eq: valueToUse };
      }
      break;
    case "ne":
      if (boolValue !== undefined) {
        tempQuery = { $ne: boolValue };
      } else {
        tempQuery = { $ne: valueToUse };
      }
      break;
    case "gt":
      tempQuery = { $gt: valueToUse };
      break;
    case "gte":
      tempQuery = { $gte: valueToUse };
      break;
    case "lt":
      tempQuery = { $lt: valueToUse };
      break;
    case "lte":
      tempQuery = { $lte: valueToUse };
      break;
    case "in":
      tempQuery = { $in: valueToUse };
      break;
    case "nin":
      tempQuery = { $nin: valueToUse };
      break;
    case "regex":
      tempQuery = { $regex: valueToUse };
      if (!caseSensitive) {
        tempQuery.$options = "i";
      } else {
        tempQuery.$options = "";
      }
      break;
    case "beginsWith":
      tempQuery = { $regex: `^${valueToUse}` };
      if (!caseSensitive) {
        tempQuery.$options = "i";
      }
      break;
    case "endsWith":
      tempQuery = { $regex: `${valueToUse}$` };
      if (!caseSensitive) {
        tempQuery.$options = "i";
      }
      break;
    default:
      throw new Error(`Invalid relational operator: ${relOper}`);
  }

  query[key] = logNOT ? { $not: tempQuery } : tempQuery;

  return query;
}


/**
 * @name processArrayElements
 * @method
 * @memberof GraphQL/Filter
 * @summary Process a simple/single condition by calling simpleConditionToQuery
 * @param {Object} element - simple/single condition to be processed
 * @returns {Boolean} - query object for a single condition
 */
function processArrayElements(element) {
  const allKeys = Object.keys(element);
  if (allKeys.length !== 1) {
    throw new Error("Invalid input. Array element must have exactly one key");
  }

  const relOp = allKeys[0];
  if (!REL_OPS_KEYS.includes(relOp)) {
    throw new Error(`Invalid relational operator: ${relOp}`);
  }

  const value = element[relOp];
  if (!Array.isArray(value)) {
    throw new Error("Invalid input. Value must be an array");
  }

  const subQueryArray = [];
  for (const item of value) {
    const fieldKeys = Object.keys(item);
    const validFieldKeys = verifyAllFieldKeys(fieldKeys);
    if (!validFieldKeys) {
      throw new Error("Invalid input. Invalid key in array element");
    }
    const singleQueryObject = simpleConditionToQuery(item);
    subQueryArray.push(singleQueryObject);
  }

  const queryObject = {};
  queryObject[keyMap[relOp]] = subQueryArray;
  return queryObject;
}

/**
 * @name newProcessFilterConditions
 * @method
 * @memberof GraphQL/Filter
 * @summary This function is recursively called for all compound conditions
 * till it reaches the simple/single condition when it calls processArrayElements
 * @param {Object} filterCondition - filter condition to be processed
 * @returns {Boolean} - final query object
 */
function newProcessFilterConditions(filterCondition) {
  const isCompoundCondition = checkIfCompoundCondition(filterCondition);

  let returnObject;
  if (isCompoundCondition) {
    const allKeys = Object.keys(filterCondition);
    const singleKey = allKeys[0];
    const subConditions = filterCondition[singleKey];
    const subQueryArray = [];
    for (const subCondition of subConditions) {
      const subQuery = newProcessFilterConditions(subCondition);
      subQueryArray.push(subQuery);
    }
    const key = keyMap[singleKey];
    const query = {};
    query[key] = subQueryArray;
    returnObject = query;
  } else {
    const singleQueryObject = processArrayElements(filterCondition);
    returnObject = singleQueryObject;
  }
  return returnObject;
}


/**
 * @name generateQuery
 * @method
 * @memberof GraphQL/Filter
 * @summary Builds a selector for Products collection, given a set of filters
 * @param {Object} filterQuery - an object containing the filters to apply
 * @param {String} shopId - the shop ID
 * @returns {Object} - selector
 */
function generateQuery(filterQuery, shopId) {
  if (!filterQuery) return {};

  if (_.size(filterQuery) === 0) return {};

  const keysTopLevel = Object.keys(filterQuery);
  if (keysTopLevel.length !== 1) {
    throw new Error("filterQuery must have exactly one key");
  }
  const topLevelKey = keysTopLevel[0];
  if (!REL_OPS_KEYS.includes(topLevelKey)) {
    throw new Error(`Invalid top level key: ${topLevelKey}. Expected one of: ${REL_OPS_KEYS.join(", ")}`);
  }

  const selectorObject = newProcessFilterConditions(filterQuery);

  // If a shopId was provided, add it
  if (shopId) {
    selectorObject.shopId = shopId;
  }

  return selectorObject;
}

/**
 * @name filterSearchProducts
 * @method
 * @memberof GraphQL/Filter
 * @summary Query the Products collection for a list of products
 * @param {Object} context - an object containing the per-request state
 * @param {String} collectionName - Collection against which to run the query
 * @param {Object} filter1level - an object containing ONE level of filters to apply
 * @param {Object} filter2level - an object containing TWO levels of filters to apply
 * @param {Object} filter3level - an object containing THREE levels of filters to apply
 * @param {Object} level - number of levels used in filter object
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Products object Promise
 */
export default function generateFilterQuery(context, collectionName, filter1level, filter2level, filter3level, level, shopId) {
  let filterQuery;
  switch (level) {
    case "ONE":
      if (!filter1level) {
        throw new Error("filter1level is required when level ONE is used");
      }
      FilterOneLevelSchema.validate(filter1level);
      filterQuery = filter1level;
      break;
    case "TWO":
      if (!filter2level) {
        throw new Error("filter2level is required when level TWO is used");
      }
      FilterTwoLevelSchema.validate(filter2level);
      filterQuery = filter2level;
      break;
    case "THREE":
      if (!filter3level) {
        throw new Error("filter3level is required when level THREE is used");
      }
      FilterThreeLevelSchema.validate(filter3level);
      filterQuery = filter3level;
      break;
    default:
      throw new Error("Invalid level");
  }

  const allConditions = collectAtomicFilters(filterQuery);
  const allCollectionFields = collectCollectionFields(context, collectionName);
  validateConditions(allConditions, allCollectionFields);

  const selector = generateQuery(filterQuery, shopId);
  return {
    filterQuery: selector
  };
}
