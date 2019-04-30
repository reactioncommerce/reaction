import packageJson from "/package.json";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name queries.systemInformation
 * @method
 * @memberof SystemInformation/GraphQL
 * @summary get systemInformation
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId The ID of the shop to load settings for
 * @return {Promise<Object>} System Information
 **/
export default async function systemInformation(context, shopId) {
  const { userHasPermission, collections: { Packages }, app: {db} } = context;
  // sensitive information should be accesible to admins only
  if (!context.userHasPermission(["admin"], shopId)) throw new ReactionError("access-denied", "User does not have permission");

  const mongoAdmin = await db.admin();
  const mongoInfo = await mongoAdmin.serverStatus();
  const plugins = await Packages.find({ shopId: shopId, version: { $exists: true }}, {projection: { name: 1, version: 1 } }).toArray();
  return {
    apiVersion: packageJson.version,
    mongoVersion: { version: mongoInfo.version },
    plugins: plugins.map(({ name, version }) => ({ name, version }))
  };
}
