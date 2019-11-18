import { decodeShopOpaqueId, decodeTemplateOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.updateTemplate
 * @method
 * @memberof Routes/GraphQL
 * @summary Update a specified redirect rule
 * @param {Object} parentResult - unused
 * @param {Object} args.input - updateTemplateInput
 * @param {String} args.input.title - path to redirect from
 * @param {String} args.input.subject - path to redirect to
 * @param {Boolean} args.input.template - whether the tag is visible
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateTemplatePayload
 */
export default async function updateTemplate(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    id: opaqueTemplateId,
    shopId: opaqueShopId,
    ...templateInput
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const templateId = decodeTemplateOpaqueId(opaqueTemplateId);

  const template = await context.mutations.updateTemplate(context, {
    shopId,
    templateId,
    ...templateInput
  });

  return {
    clientMutationId,
    template
  };
}
