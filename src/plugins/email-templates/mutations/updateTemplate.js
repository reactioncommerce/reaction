import { EmailTemplates } from "../simpleSchemas";

/**
 * @name updateTemplate
 * @summary Updates email template in Templates collection
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input._id - _id of template to update.
 * @param {Object} input.modifier - Template data to update.
 * @returns {Number} update template
 */
export default async function updateTemplate(context, input) {
  const { checkPermissions, collections } = context;
  const { Templates } = collections;
  const { _id, modifier } = input;

  const shopId = await context.queries.primaryShopId(context);

  await checkPermissions(["reaction-templates"], shopId);

  EmailTemplates.validate(modifier, { modifier: true });

  return Templates.update({
    _id,
    type: "email",
    shopId // Ensure that the template we're attempting to update is owned by the active shop.
  }, modifier);
}
