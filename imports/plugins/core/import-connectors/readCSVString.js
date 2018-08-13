
/**
 * @summary Function copied from https://github.com/mholt/PapaParse/blob/fb6f96ea9901b523b1b296bee8dbdba568a2fefc/papaparse.js#L1255-L1276
 * @param {String} input - TODO
 * @returns {String} TODO
 */
function guessLineEndings(input) {
  const subInput = input.substr(0, 1024 * 1024); // max length 1 MB
  const rrows = subInput.split("\r");
  const nrows = subInput.split("\n");
  const nAppearsFirst = (nrows.length > 1 && nrows[0].length < rrows[0].length);
  if (rrows.length === 1 || nAppearsFirst) {
    return "\n";
  }
  let numWithN = 0;
  rrows.forEach((rrow) => {
    if (rrow[0] === "\n") {
      numWithN += 1;
    }
  });
  return numWithN >= rrows.length / 2 ? "\r\n" : "\r";
}

/**
 * @summary Get relevant data for matching fields
 * @param {String} input - TODO
 * @returns {String} TODO
 */
export function getFieldMatchingRelevantData(input, hasHeader = true, delimiter = ",") {
  const newLineSeparator = guessLineEndings(input);
  const csvRows = input.split(newLineSeparator);
  let header = [];
  const sampleData = [];
  let rowStart = 0;
  let rowEnd = 2;
  if (hasHeader) {
    header = csvRows[0].split(delimiter);
    rowStart = 1;
    rowEnd = 3;
  }
  for (let i = rowStart; i <= rowEnd; i += 1) {
    const rowArray = csvRows[i].split(delimiter);
    for (let j = 0; j < rowArray.length; j += 1) {
      if (sampleData[j] === undefined) {
        sampleData[j] = [];
      }
      sampleData[j].push(rowArray[j]);
    }
  }
  return {
    header,
    sampleData
  };
}
