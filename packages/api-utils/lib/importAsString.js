import fs from "fs";
import { createRequire as createRequireFromPath } from "module";
import stack from "callsite";

/**
 * @summary import the contents of another file as a string
 * @param {Object} specifier A valid import specifier, such as
 *   a relative path or a path within a node_modules package
 * @return {String} The file contents
 */
export default function importAsString(specifier) {
  const caller = stack()[1];
  const callerFileName = caller.getFileName();
  const require = createRequireFromPath(callerFileName);

  return fs.readFileSync(require.resolve(specifier), { encoding: "utf8" });
}
