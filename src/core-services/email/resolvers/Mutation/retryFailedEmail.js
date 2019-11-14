import { decodeJobOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.retryFailedEmail
 * @method
 * @memberof Routes/GraphQL
 * @summary Retry a failed or cancelled email job
 * @param {Object} parentResult - unused
 * @param {Object} args.input - RetryFailedEmailInput
 * @param {String} args.input.id - Email Job id
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} RetryFailedEmailPayload
 */
export default async function retryFailedEmail(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    jobId: opaqueJobId,
    shopId: opaqueShopId
  } = input;
  const resp = await context.mutations.retryFailedEmail(context, {
    jobId: decodeJobOpaqueId(opaqueJobId),
    shopId: decodeShopOpaqueId(opaqueShopId)
  });

  return {
    clientMutationId,
    emailSent: resp
  };
}
