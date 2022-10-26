import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { FulfillmentMethodSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  method: FulfillmentMethodSchema,
  fulfillmentTypeId: String,
  shopId: String
});

/**
 * @method createFulfillmentMethodMutation
 * @summary Creates a fulfillment method
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input
 * @param {Number} cost - optional cost
 * @param {String[]} fulfillmentTypes - fulfillment type retained for backward compatibility
 * @param {String} group - Group to which fulfillment method belong
 * @param {Number} handling - handling charges
 * @param {Boolean} enabled - status of fulfillment method
 * @param {String} label - displayed on the UI
 * @param {String} fulfillmentMethod - used by application, not user editable
 * @param {String} displayMessageMethod - used to display additional message on UI specific to ff-method
 * @param {Number} rate - ratefor themethod
 * @returns {Promise<Object>} An object with a `method` property containing the created method
 */
export default async function createFulfillmentMethodMutation(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { method: inputMethod, fulfillmentTypeId, shopId } = cleanedInput;
  const { collections } = context;
  const { Fulfillment } = collections;
  const method = { ...inputMethod };

  await context.validatePermissions("reaction:legacy:fulfillmentMethods", "create", { shopId });

  const ffTypeRecord = await Fulfillment.findOne({ _id: fulfillmentTypeId, shopId });
  if (!ffTypeRecord) throw new ReactionError("server-error", "Unable to create fulfillment method without defined type");

  const ffTypeMethodRecord = await Fulfillment.findOne({
    _id: fulfillmentTypeId,
    shopId,
    methods: { $elemMatch: { fulfillmentMethod: method.fulfillmentMethod } }
  });
  if (ffTypeMethodRecord) throw new ReactionError("server-error", "Fulfillment Method already exists");

  method._id = Random.id();
  method.fulfillmentTypes = [ffTypeRecord.fulfillmentType];

  const { matchedCount } = await Fulfillment.updateOne({
    shopId,
    _id: fulfillmentTypeId
  }, {
    $addToSet: {
      methods: method
    }
  });

  if (matchedCount === 0) throw new ReactionError("server-error", "Unable to create fulfillment method");

  return { group: method };
}
