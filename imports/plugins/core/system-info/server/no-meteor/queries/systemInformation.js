import packageJson from "/package.json";

/**
 * @name queries.systemInformation
 * @method
 * @memberof SystemInformation/GraphQL
 * @summary get systemInformations
 * @return {<Object} System Information
 **/
export default async function systemInformation() {
  return {
    apiVersion: packageJson.version
  };
}
