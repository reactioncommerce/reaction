import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";
import decodeNavigationTreeItemIds from "../../util/decodeNavigationTreeItemIds.js";
/**
 * @name Mutation.createNavigationTree
 * @method
 * @memberof Navigation/GraphQL
 * @summary resolver for createNavigationTree GraphQL mutation
 * @param {Object} parentResult Unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.name The name of the navigation tree to create
 * @param {String} args.input.shopId Shop ID of the navigation tree to create
 * @param {String} args.input.draftItems The draft navigation items for the navigation tree to create
 * @param {Object} context An object containing the per-request state
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @returns {Promise<Object>} CreateNavigationTreePayload
 */
export default async function createNavigationTree(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    shopId: opaqueShopId
  } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;
  if (input.draftItems) {
    const { draftItems } = input;
    decodeNavigationTreeItemIds(draftItems);
    input.draftItems = draftItems;
  }

  const createdNavigationTree = await context.mutations.createNavigationTree(context, {
    ...input,
    shopId
  });

  return {
    clientMutationId,
    navigationTree: createdNavigationTree
  };
}
