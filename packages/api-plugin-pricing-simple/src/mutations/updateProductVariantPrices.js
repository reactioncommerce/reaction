import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const pricesInput = new SimpleSchema({
  compareAtPrice: {
    type: Number,
    optional: true
  },
  price: {
    type: Number,
    optional: true
  },
  priceType: {
    type: String,
    optional: true,
    allowedValues: ["full", "clearance", "sale"]
  }
});

const inputSchema = new SimpleSchema({
  prices: {
    type: pricesInput
  },
  shopId: String,
  variantId: String
});

/**
 * @method updateProductVariantPrices
 * @summary Updates the price fields on a product variant
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {Object} input.prices - prices to update
 * @param {Object} [input.prices.compareAtPrice] - variant compareAtPrice
 * @param {Object} [input.prices.price] - variant price
 * @param {String} input.variantId - variantId of product to update
 * @param {String} input.shopId - shopId of shop product belongs to
 * @return {Promise<Object>} updateProductVariant payload
 */
export default async function updateProductVariantPrices(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections } = context;
  const { Products } = collections;
  const { prices, variantId, shopId } = input;

  // Check that user has permission to create product
  await context.validatePermissions(`reaction:legacy:products:${variantId}`, "update:prices", {
    shopId
  });

  const fields = Object.keys(prices);
  if (fields.length === 0) throw new ReactionError("invalid-param", "At least one field to update must be provided");

  const { value: updatedProductVariant } = await Products.findOneAndUpdate(
    { _id: variantId, shopId, type: "variant" },
    { $set: { ...prices } },
    { returnOriginal: false }
  );

  if (!updatedProductVariant) throw new ReactionError("error-occurred", "Unable to update variant prices");

  await appEvents.emit("afterVariantUpdate", {
    fields,
    productId: updatedProductVariant.ancestors[0],
    productVariant: updatedProductVariant,
    productVariantId: variantId
  });

  return updatedProductVariant;
}
