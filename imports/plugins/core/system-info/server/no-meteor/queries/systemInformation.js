import ReactionError from "@reactioncommerce/reaction-error";
import packageJson from "/package.json";

/**
 * @name queries.systemInformation
 * @method
 * @memberof Tags/GraphQL
 * @summary get systemInformations
 * @param {Object} context - an object containing the per-request state
 * @param {String} [params.shopId] - Shop ID
 * @return {Promise<Array<Object>>} array of TagProduct
 **/
export default async function systemInformation(context) {
  // if (!context.userHasPermission(["owner", "admin"], shopId)) {
  //   throw new ReactionError("access-denied", "Access denied");
  // }

  return {
    apiVersion: packageJson['version']
  };
}
