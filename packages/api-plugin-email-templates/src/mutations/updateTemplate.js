import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema(
  {
    templateId: String,
    shopId: String,
    title: { type: String, optional: true },
    subject: { type: String, optional: true },
    template: { type: String, optional: true }
  },
  { requiredByDefault: false }
);

/**
 * @name updateTemplate
 * @summary Updates email template in Templates collection
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @returns {Promise<Object>} UpdateTemplatePayload
 */
export default async function updateTemplate(context, input) {
  const { collections } = context;
  const { Templates } = collections;
  const { templateId, shopId, ...params } = input;

  await context.validatePermissions("reaction:legacy:email-templates", "update", { shopId });

  inputSchema.validate(params);

  params.updatedAt = new Date();

  try {
    const { result } = await Templates.updateOne(
      { _id: templateId, shopId },
      { $set: params }
    );

    if (result.n === 0) {
      throw new ReactionError("not-found", "Template not found");
    }

    const template = await Templates.findOne({ _id: templateId, shopId });

    return template;
  } catch ({ message }) {
    throw new ReactionError("error", message);
  }
}
