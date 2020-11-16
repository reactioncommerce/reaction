import Logger from "@reactioncommerce/logger";

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
  const { app: { db } } = context;

  await context.validatePermissions(`reaction:legacy:shops:${shopId}`, "read", { shopId });

  let mongoVersion = "";

  try {
    const mongoAdmin = await db.admin();
    const mongoInfo = await mongoAdmin.serverStatus();
    mongoVersion = mongoInfo.version;
  } catch (error) {
    Logger.error(error);
  }

  const plugins = Object.values(context.app.registeredPlugins).filter((plugin) => plugin.version);
  return {
    apiVersion: context.appVersion,
    mongoVersion: { version: mongoVersion },
    plugins: plugins.map(({ name, version }) => ({ name, version }))
  };
}
