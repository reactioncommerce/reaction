import ReactionError from "@reactioncommerce/reaction-error";
import { ProductVariantInputSchema } from "../simpleSchemas.js";

/**
 * @method updateProductVariant
 * @summary Updates various fields on a product variant
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.field - product field to update
 * @param {String} input.variantId - variantId of product to update
 * @param {String} input.shopId - shopId of shop product belongs to
 * @param {String} input.value - value to update field with
 * @return {Promise<Object>} updateProductVariant payload
 */
export default async function updateProductVariant(context, input) {
  const { appEvents, collections } = context;
  const { Products } = collections;
  const { variant: variantInput, variantId, shopId } = input;

  // Check that user has permission to create product
  await context.validatePermissions(
    `reaction:legacy:products:${variantId}`,
    "update",
    { shopId }
  );

  ProductVariantInputSchema.validate(variantInput);
  const fields = Object.keys(variantInput);
  if (fields.length === 0) throw new ReactionError("invalid-param", "At least one field to update must be provided");

  const currentProduct = await Products.findOne({ _id: variantId, shopId });
  if (!currentProduct) throw new ReactionError("not-found", "Product variant not found");

  const { value: updatedProductVariant } = await Products.findOneAndUpdate(
    {
      _id: variantId,
      shopId
    },
    {
      $set: {
        ...variantInput,
        updatedAt: new Date()
      }
    },
    {
      returnOriginal: false
    }
  );

  await appEvents.emit("afterVariantUpdate", {
    fields,
    productId: updatedProductVariant.ancestors[0],
    productVariant: updatedProductVariant,
    productVariantId: variantId
  });

  return updatedProductVariant;
}
