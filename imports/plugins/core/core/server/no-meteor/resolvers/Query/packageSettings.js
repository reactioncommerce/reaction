import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import ReactionError from "/imports/utils/ReactionError";

/**
 * @name Query.packageSettings
 * @method
 * @memberof Shop/GraphQL
 * @summary Gets the primary shop ID
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - ID of shop to query
 * @param {String} args.name - name of package
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<String>} The shop ID based on the domain in ROOT_URL
 */
export default async function packageSettings(_, args, context) {
  const { name, shopId: opaqueShopId } = args;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const { collections, userHasPermission } = context;
  const { Packages } = collections;

  if (userHasPermission(["admin"], shopId) === false) {
    throw new ReactionError("access-denied", "User does not have permission to update Bronto settings");
  }

  const { settings } = await Packages.findOne({ name, shopId });

  const formattedName = name.substring(0, 1).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  return {
    gqlType: `${formattedName}SettingsData`,
    ...settings
  };
}
