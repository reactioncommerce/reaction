/**
 * @name Query.getCommonOrderForCartGroup
 * @method
 * @memberof Cart/GraphQL
 * @summary Get a CommonOrder object for a cart fulfillment group
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.cart - cart object
 * @param {String} args.fulfillmentGroup - group object
 * @param {Object} context - An object containing the per-request state
 * @returns {Promise<Object>|undefined} A CommonOrder object
 */
export default async function getCommonOrderForCartGroup(parentResult, args, context) {
  const { cart, fulfillmentGroup } = args;

  return context.queries.getCommonOrderForCartGroup(context, {
    cart,
    fulfillmentGroup
  });
}
