import { decodeShopOpaqueId } from "../../xforms/id.js";
import createFulfillmentTypeMutation from "../../mutations/createFulfillmentType.js";

/**
 * @name Mutation/createFulfillmentType
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the createFulfillmentType GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.groupInfo] - an object of all mutation arguments that were sent by the clientAn optional string identifying the mutation call
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateFulfillmentTypePayload
 */
export default async function createFulfillmentType(parentResult, { input }, context) {
  const { groupInfo, clientMutationId = null } = input;
  const { shopId: opaqueShopId } = groupInfo;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const { group } = await createFulfillmentTypeMutation(context, {
    ...groupInfo,
    shopId
  });

  return {
    group,
    clientMutationId
  };
}
