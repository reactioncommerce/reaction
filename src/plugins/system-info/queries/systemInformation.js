/**
 * @name queries.systemInformation
 * @method
 * @memberof SystemInformation/GraphQL
 * @summary get systemInformation
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId The ID of the shop to load settings for
 * @returns {Promise<Object>} System Information
 **/
export default async function systemInformation(context, shopId) {
  const { validatePermissions, validatePermissionsLegacy, app: { db } } = context;
  // sensitive information should be accessible to admins only
  await validatePermissionsLegacy(["admin"], shopId);
  await validatePermissions(`reaction:shop:${shopId}`, "read", { shopId });

  const mongoAdmin = await db.admin();
  const mongoInfo = await mongoAdmin.serverStatus();
  const plugins = await Object.values(context.app.registeredPlugins).filter((plugin) => plugin.version);
  return {
    apiVersion: context.appVersion,
    mongoVersion: { version: mongoInfo.version },
    plugins: plugins.map(({ name, version }) => ({ name, version }))
  };
}
