/**
 * @name emailTemplates
 * @method
 * @memberof GraphQL/Templates
 * @summary Query the Templates collection for a list of email templates
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of the shop to query against
 * @returns {Promise<Object>} Email templates cursor
 */
export default async function emailTemplates(context, shopId) {
  const { collections } = context;
  const { Templates } = collections;

  await context.validatePermissions("reaction:legacy:email-templates", "read", { shopId });

  return Templates.find({
    shopId,
    type: "email"
  });
}
