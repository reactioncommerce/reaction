/**
 * Given an HTTP request and a file size, builds a simple object that
 * contains the requested data range based on the "range" header in the request.
 * @param {Object} headers A headers object that may or may not have a "range" key
 * @param {Number} fileSize The number of bytes in the whole file being requested
 * @returns {Object} Range info
 *   {Number} end The last byte position requested
 *   {Number} len The number of bytes requested
 *   {Boolean} partial True if less than the total number of bytes has been requested
 *   {Number} size The fileSize that was passed in
 *   {Number} start The first byte position requested
 *   {Number} unit The "unit" from the "range" header, which currently must be "bytes"
 */
export default function requestRange(headers, fileSize) {
  if (!headers) throw new Error("headers missing");

  if (!fileSize) {
    return {
      errorCode: 416,
      errorMessage: "Requested Range Not Satisfiable (Unknown File Size)"
    };
  }

  const defaultRange = {
    end: fileSize - 1,
    len: fileSize,
    partial: false,
    size: fileSize,
    start: 0,
    unit: "bytes"
  };

  const { range } = headers;
  if (typeof range !== "string") return defaultRange;

  // range will be in the format "bytes=0-32767"
  const parts = range.split("=");
  if (parts.length !== 2) {
    return {
      errorCode: 416,
      errorMessage: "Requested Range Unit Not Satisfiable"
    };
  }

  const [unit, byteRange] = parts;
  if (unit !== "bytes") {
    return {
      errorCode: 416,
      errorMessage: "Requested Range Unit Not Satisfiable"
    };
  }

  // Parse the range
  const [start, end] = byteRange.split("-");
  let startByte = Number(start);
  let endByte = Number(end);

  // Fix invalid (non-numeric) ranges
  if (String(startByte) !== start) startByte = 0;
  if ((String(endByte) !== end) || endByte === 0) endByte = fileSize - 1;

  if (startByte >= endByte || endByte >= fileSize) {
    return {
      errorCode: 416,
      errorMessage: "Requested Range Not Satisfiable"
    };
  }

  const partSize = (endByte - startByte) + 1;
  return {
    end: endByte,
    len: partSize,
    partial: (partSize < fileSize),
    size: fileSize,
    start: startByte,
    unit
  };
}
