import packageJson from "/package.json";
import ReactionError from "@reactioncommerce/reaction-error";


/**
 * @name queries.systemInformation
 * @method
 * @memberof SystemInformation/GraphQL
 * @summary get systemInformations
 * @param {String} args.shopId The ID of the shop to load settings for
 * @param {Object} context - an object containing the per-request state
 * @return {<Object} System Information
 **/
export default async function systemInformation(id, context) {
  if (!context.userHasPermission(["owner", "admin"], id)) throw new ReactionError("access-denied", "User does not have permission");
  const plugins = await context.collections.Packages.find({ shopId: id, version: { $exists: true } }).toArray();
  return {
    apiVersion: packageJson.version,
    plugins: plugins.map(({ name, version }) => ({ name, version }))
  };
}
