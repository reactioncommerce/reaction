"use strict";var _Object$keys = require("@babel/runtime-corejs2/core-js/object/keys");var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols");var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors");var _Object$defineProperties = require("@babel/runtime-corejs2/core-js/object/define-properties");var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");_Object$defineProperty(exports, "__esModule", { value: true });exports.default = getUrlForFileRecord;var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));var _queryString = _interopRequireDefault(require("query-string"));function ownKeys(object, enumerableOnly) {var keys = _Object$keys(object);if (_Object$getOwnPropertySymbols) {var symbols = _Object$getOwnPropertySymbols(object);enumerableOnly && (symbols = symbols.filter(function (sym) {return _Object$getOwnPropertyDescriptor(object, sym).enumerable;})), keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = null != arguments[i] ? arguments[i] : {};i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {(0, _defineProperty2.default)(target, key, source[key]);}) : _Object$getOwnPropertyDescriptors ? _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {_Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key));});}return target;}

/**
 * @param {FileRecord} fileRecord object to get rl for
 * @param {Object} param1 settings for url builder
 * @returns {String} url of fileRecord
 */
function getUrlForFileRecord(fileRecord, {
  absolute = false,
  absoluteUrlPrefix,
  download = false,
  filename = null, // override the filename that is shown to the user
  prefix = "",
  store = null,
  query = {} })
{
  if (!fileRecord.collectionName) throw new Error("FileRecord.url: File must have attached collection");
  if (!store) throw new Error("FileRecord.url: store is required");

  // Prevent a broken link appearing
  if (!fileRecord.hasStored(store)) return null;

  // Add filename to end of URL if we can determine one
  const finalFileName = filename || fileRecord.name({ store });
  if (!finalFileName) throw new Error("FileRecord.url: filename is required");

  // Construct query string
  const params = _objectSpread({}, query);
  if (download) params.download = 1;
  let qs = _queryString.default.stringify(params);
  if (qs.length) qs = `?${qs}`;

  // Construct and return the http method url
  let finalPrefix = prefix;
  if (!finalPrefix.startsWith("/")) finalPrefix = `/${finalPrefix}`;
  let pathPart = [finalPrefix, fileRecord.collectionName, fileRecord._id, store, finalFileName].join("/").replace(/([^:]\/)\/+/g, "$1");
  if (pathPart.endsWith("/")) pathPart = pathPart.slice(0, -1);
  const relativeUrl = pathPart + qs;

  if (!absolute) return relativeUrl;

  if (typeof absoluteUrlPrefix !== "string") throw new Error("FileRecord.url: Requested absolute URL without setting absoluteUrlPrefix");

  let finalAbsoluteUrlPrefix = absoluteUrlPrefix;
  if (finalAbsoluteUrlPrefix.endsWith("/")) finalAbsoluteUrlPrefix = finalAbsoluteUrlPrefix.slice(0, -1);
  return [finalAbsoluteUrlPrefix, relativeUrl].join("");
}