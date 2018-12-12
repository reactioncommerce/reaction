import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import ReactionError from "/imports/utils/ReactionError";

/**
 * @name Query.pluginSettings
 * @method
 * @memberof Shop/GraphQL
 * @summary Returns plugin settings data by providing shopId and the name of the plugin
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - ID of shop to query
 * @param {String} args.name - name of plugin
 * @param {Object} context - an object containing the per-request state
 * @return {Object} Settings data for the requested plugin
 */
export default async function pluginSettings(_, args, context) {
  const { name, shopId: opaqueShopId } = args;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const { collections, userHasPermission } = context;
  const { Packages } = collections;

  let { settings } = await Packages.findOne({ name, shopId });

  if (!settings) {
    throw new ReactionError("not-found", `Settings for ${name} plugin not found.`);
  }

  if (userHasPermission(["admin"], shopId) === false) {
    settings = { public: settings.public };
  }

  return { settings };
}
