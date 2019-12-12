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
  await context.validatePermissions(`reaction:products:${variantId}`, "update:prices", {
    shopId,
    legacyRoles: ["createProduct", "product/admin", "product/update"]
  });

  const { value: updatedProduct } = await Products.findOneAndUpdate(
    { _id: variantId, shopId, type: "variant" },
    { $set: { ...prices }},
    { returnOriginal: false }
  );

  if (!updatedProduct) throw new ReactionError("error-occurred", "Unable to update variant prices");

  appEvents.emit("afterVariantUpdate", { productId: variantId, product: updatedProduct });

  return updatedProduct;
}
