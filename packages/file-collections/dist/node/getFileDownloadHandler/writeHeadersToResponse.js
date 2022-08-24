"use strict";var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");_Object$defineProperty(exports, "__esModule", { value: true });exports.default = writeHeadersToResponse;var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys")); /**
 * Takes a headers object and calls `response.setHeader` for each.
 * @param {http.Response} res An HTTP response
 * @param {Object} headers An object with header names as keys and content as values
 * @returns {undefined}
 */
function writeHeadersToResponse(res, headers) {
  (0, _keys.default)(headers || {}).forEach((headerName) => {
    const value = headers[headerName];
    if (value) res.setHeader(headerName, value);
  });
}