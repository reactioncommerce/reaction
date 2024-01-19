import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeNavigationTreeOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.publishNavigationChanges
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for publishNavigationChanges GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.id ID of the navigation tree to publish changes
 * @param {String} args.input.shopId Shop ID of the navigation tree to publish changes
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context An object containing the per-request state
 * @returns {Promise<Object>} publishNavigationChangesPayload
 */
export default async function publishNavigationChanges(parentResult, { input }, context) {
  const { clientMutationId = null, id: opaqueNavigationTreeId, shopId: opaqueShopId } = input;

  const decodedId = isOpaqueId(opaqueNavigationTreeId) ? decodeNavigationTreeOpaqueId(opaqueNavigationTreeId) : opaqueNavigationTreeId;
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;
  const publishedNavigationTree = context.mutations.publishNavigationChanges(context, {
    navigationTreeId: decodedId,
    shopId
  });

  return {
    clientMutationId,
    navigationTree: publishedNavigationTree
  };
}
