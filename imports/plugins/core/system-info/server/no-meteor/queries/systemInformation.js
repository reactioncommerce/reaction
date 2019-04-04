import packageJson from "/package.json";

/**
 * @name queries.systemInformation
 * @method
 * @memberof SystemInformation/GraphQL
 * @summary get systemInformations
 * @param {Object} context - an object containing the per-request state
 * @return {<Object} System Information
 **/
export default async function systemInformation(context) {
  return {
    apiVersion: packageJson.version,
    plugins: await context.collections.Packages.find({ version: { $exists: true } }).toArray()
  };
}
