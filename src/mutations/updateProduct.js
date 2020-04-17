import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import cleanProductInput from "../utils/cleanProductInput.js";

const inputSchema = new SimpleSchema({
  product: {
    type: Object,
    blackbox: true,
    optional: true
  },
  productId: String,
  shopId: String
});

/**
 * @method updateProduct
 * @summary Updates a product
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.field - product field to update
 * @param {String} input.productId - productId of product to update
 * @param {String} input.shopId - shopId of shop product belongs to
 * @param {String} input.value - value to update field with
 * @return {Promise<Object>} updateProduct payload
 */
export default async function updateProduct(context, input) {
  inputSchema.validate(input);

  const { appEvents, collections, simpleSchemas } = context;
  const { Product } = simpleSchemas;
  const { Products } = collections;
  const { product: productInput, productId, shopId } = input;

  // Check that user has permission to create product
  await context.validatePermissions(
    `reaction:legacy:products:${productId}`,
    "update",
    { shopId }
  );

  const currentProduct = await Products.findOne({ _id: productId, shopId });
  if (!currentProduct) throw new ReactionError("not-found", "Product not found");

  const updateDocument = await cleanProductInput(context, {
    currentProductHandle: currentProduct.handle,
    productId,
    productInput,
    shopId
  });

  if (Object.keys(updateDocument).length === 0) {
    throw new ReactionError("invalid-param", "At least one field to update must be provided");
  }

  updateDocument.updatedAt = new Date();

  const modifier = { $set: updateDocument };

  Product.validate(modifier, { modifier: true });

  const { value: updatedProduct } = await Products.findOneAndUpdate(
    {
      _id: productId,
      shopId
    },
    modifier,
    {
      returnOriginal: false
    }
  );

  await appEvents.emit("afterProductUpdate", { productId, product: updatedProduct });

  return updatedProduct;
}
