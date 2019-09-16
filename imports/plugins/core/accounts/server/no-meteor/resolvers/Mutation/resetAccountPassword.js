/**
 * @name Mutation/resetAccountPassword
 * @summary resolver for the resetAccountPassword GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.email - email of account to reset
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} r=ResetAccountPasswordPayload
 */
export default async function resetAccountPassword(_, { input }, context) {
  const { email, clientMutationId = null } = input;

  const emailAddress = await context.mutations.resetAccountPassword(context, {
    email
  });

  return {
    email: emailAddress,
    clientMutationId
  };
}
