/**
 * Takes a headers object and calls `response.setHeader` for each.
 * @param {http.Response} res An HTTP response
 * @param {Object} headers An object with header names as keys and content as values
 * @returns {undefined}
 */
export default function writeHeadersToResponse(res, headers) {
  Object.keys(headers || {}).forEach((headerName) => {
    const value = headers[headerName];
    if (value) res.setHeader(headerName, value);
  });
}
