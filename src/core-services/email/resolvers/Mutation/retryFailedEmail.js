import { decodeJobOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.resendFailedEmail
 * @method
 * @memberof Routes/GraphQL
 * @summary Add a tag
 * @param {Object} parentResult - unused
 * @param {Object} args.input - ResendFailedEmailInput
 * @param {String} args.input.id - Email Job id
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} ResendFailedEmailPayload
 */
export default async function resendFailedEmail(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    jobId: opaqueJobId
  } = input;
  const resp = await context.mutations.resendFailedEmail(context, {
    jobId: decodeJobOpaqueId(opaqueJobId)
  });

  return {
    clientMutationId,
    emailSent: resp
  };
}