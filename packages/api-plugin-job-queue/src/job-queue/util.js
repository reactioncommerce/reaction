/* eslint-disable require-jsdoc */

export function __range__(left, right, inclusive) {
  const range = [];
  const ascending = left < right;
  let end;

  if (!inclusive) {
    end = right;
  } else if (ascending) {
    end = right + 1;
  } else {
    end = right - 1;
  }

  for (let index = left; ascending ? index < end : index > end; ascending ? index += 1 : index -= 1) {
    range.push(index);
  }
  return range;
}

export function optionsHelp(opts, cb) {
  let options = opts;
  let callback = cb;

  // If cb isn't a function, it's assumed to be options...
  if (cb && typeof cb !== "function") {
    options = cb;
    callback = undefined;
  } else {
    if ((typeof options !== "object") ||
      !(options instanceof Array) ||
      !(options.length < 2)) {
      throw new Error("options... in optionsHelp must be an Array with zero or one elements");
    }
    options = (options && options[0]) || {};
  }
  if (typeof options !== "object") {
    throw new Error("in optionsHelp options not an object or bad callback");
  }
  return [options, callback];
}

export function splitLongArray(arr, max) {
  if (!(arr instanceof Array) || !(max > 0)) { throw new Error("splitLongArray: bad params"); }
  return __range__(0, Math.ceil(arr.length / max), false).map((index) => arr.slice((index * max), ((index + 1) * max)));
}

// This function soaks up num callbacks, by default returning the disjunction of Boolean results
// or returning on first error.... Reduce function causes different reduce behavior, such as concatenation
export function reduceCallbacks(cb, num, reduce = (itemA, itemB) => itemA || itemB, init = false) {
  if (!cb) {
    return null;
  }

  if ((typeof cb !== "function") || !(num > 0) || (typeof reduce !== "function")) {
    throw new Error("Bad params given to reduceCallbacks");
  }
  let cbRetVal = init;
  let cbCount = 0;
  let cbErr = null;

  return (err, res) => {
    if (!cbErr) {
      if (err) {
        cbErr = err;
        cb(err);
        return;
      }

      cbCount += 1;
      cbRetVal = reduce(cbRetVal, res);
      if (cbCount === num) {
        cb(null, cbRetVal);
        return;
      } else if (cbCount > num) {
        throw new Error(`reduceCallbacks callback invoked more than requested ${num} times`);
      }
    }
  };
}

export function concatReduce(itemA, itemB) {
  let arrayA = itemA;

  if (!(arrayA instanceof Array)) { arrayA = [arrayA]; }
  return arrayA.concat(itemB);
}

export const isInteger = (value) => (typeof value === "number") && (Math.floor(value) === value);

export const isBoolean = (value) => typeof value === "boolean";

export const isFunction = (value) => typeof value === "function";

export const isNonEmptyString = (value) => (typeof value === "string") && (value.length > 0);

export const isNonEmptyStringOrArrayOfNonEmptyStrings = (sa) =>
  isNonEmptyString(sa) ||
  (sa instanceof Array &&
    (sa.length !== 0) &&
    (((() => {
      const result = [];
      for (const item of Array.from(sa)) {
        if (isNonEmptyString(item)) {
          result.push(item);
        }
      }
      return result;
    })()).length === sa.length))
  ;

export function _setImmediate(func, ...args) {
  if (typeof setImmediate === "function") {
    return setImmediate(func, ...Array.from(args));
  }

  // Browser fallback
  return setTimeout(func, 0, ...Array.from(args));
}

const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

/**
* @summary Checks if a value is a valid bson ObjectId
* @param {Any} id ID to check
* @return {boolean} return true if the value is a valid bson ObjectId, return false otherwise.
*/
export function isValidObjectId(id) {
  if (id === null || id === undefined) return false;

  if (typeof id === "number" || typeof id === "string") return true;

  // Duck-Typing detection of ObjectId like objects
  if (id.toHexString) {
    return id.id.length === 12 || (id.id.length === 24 && checkForHexRegExp.test(id.id));
  }

  return false;
}
