import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import createProductOrVariant from "../utils/createProductOrVariant.js";

const inputSchema = new SimpleSchema({
  shopId: String
});

/**
 * @method createProduct
 * @summary creates an empty product, with an empty variant
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input arguments for the operation
 * @param {String} input.shopId - the shop to create the product for
 * @return {String} created productId
 */
export default async function createProduct(context, input) {
  inputSchema.validate(input);
  const { collections, userHasPermission } = context;
  const { Products } = collections;
  const { shopId } = input;

  // Check that user has permission to create product
  if (!userHasPermission(["createProduct", "product/admin", "product/create"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const newProductId = Random.id();
  const newProduct = {
    _id: newProductId,
    shopId,
    type: "simple"
  };

  // Create a product
  const createdProductId = await createProductOrVariant(context, newProduct);

  // Get full product document to create variant
  const createdProduct = await Products.findOne({ _id: createdProductId });

  if (!createdProduct) {
    throw new ReactionError("server-error", "Unable to find created product");
  }

  // Create a product variant
  const newVariantId = Random.id();
  const createdVariantId = await createProductOrVariant(context, {
    _id: newVariantId,
    ancestors: [createdProductId],
    shopId,
    type: "variant" // needed for multi-schema
  }, { product: createdProduct, parentVariant: null, isOption: false });

  if (!createdVariantId) {
    throw new ReactionError("server-error", "Unable to create product variant");
  }

  return createdProduct;
}
