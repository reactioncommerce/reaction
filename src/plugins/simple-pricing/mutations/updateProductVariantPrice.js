import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  "compareAtPrice": {
    type: Number,
    optional: true
  }
  "price": {
    type: Number,
    optional: true
  }
});

/**
 * @method updateProductVariantPrice
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
  const { appEvents, collections } = context;
  const { Products } = collections;
  const { prices, variantId, shopId } = input;

  // Check that user has permission to create product
  await context.validatePermissions(`reaction:products:${variantId}`, "update:prices", { shopId, legacyRoles: ["createProduct", "product/admin", "product/update"] });

  const product = await Products.findOne({ _id: variantId, shopId });
  if (!product) throw new ReactionError("not-found", "Product variant not found");

  const updateDocument = { ...prices };

  inputSchema.validate(updateDocument);

  await Products.updateOne(
    {
      _id: variantId,
      shopId
    },
    {
      $set: updateDocument
    }
  );

  const updatedProduct = Products.findOne({ _id: variantId, shopId });

  appEvents.emit("afterVariantUpdate", { productId: variantId, product: updatedProduct });

  return updatedProduct;
}
