/**
 * @summary Given some variable "version", ensures it's either
 *   a number or a string, transforms it to the standard string
 *   version format, and validates that it's acceptable.
 * @param {String|Number} version Version identifier
 * @returns {String} Cleaned and valid version, or `null`
 *   if invalid
 */
export default function validateAndTransformVersion(version) {
  if (typeof version !== "string" && typeof version !== "number") {
    throw new Error(`Version "${version}" is not a string or a number`);
  }

  const stringVersion = String(version);
  if (stringVersion === "NaN" || stringVersion === "") {
    throw new Error(`Version "${stringVersion}" is not a number`);
  }

  const versionPieces = stringVersion.split("-");
  if (versionPieces.length > 2) {
    throw new Error(`Version "${version}" has more than one dash in it`);
  }

  const [firstPiece, secondPiece = "0"] = versionPieces;

  const firstNumber = Number(firstPiece);
  if (isNaN(firstNumber) || !Number.isInteger(firstNumber)) {
    throw new Error(`The major version "${firstPiece}" of version "${version}" is not an integer`);
  }

  const secondNumber = Number(secondPiece);
  if (isNaN(secondNumber) || !Number.isInteger(secondNumber)) {
    throw new Error(`The minor version "${secondPiece}" of version "${version}" is not an integer`);
  }

  if (firstNumber < 1) {
    throw new Error(`The major version "${firstNumber}" of version "${version}" is less than the minimum of 1`);
  }

  if (secondNumber < 0) {
    throw new Error(`The minor version "${secondNumber}" of version "${version}" is less than the minimum of 0`);
  }

  return `${firstNumber}-${secondNumber}`;
}
