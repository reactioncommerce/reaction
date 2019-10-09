import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import createProductOrVariant from "../utils/createProductOrVariant.js";
import isAncestorDeleted from "../utils/isAncestorDeleted.js";

const inputSchema = new SimpleSchema({
  productId: String,
  shopId: String
});

/**
 * @method createProductVariant
 * @summary creates an empty variant on the product supplied
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.productId - the product or variant ID which we create new variant on
 * @param {String} input.shopId - the shop to create the variant for
 * @return {String} created variantId
 */
export default async function createProductVariant(context, input) {
  inputSchema.validate(input);
  const { collections, userHasPermission } = context;
  const { Products } = collections;
  const { productId, shopId } = input;

  // See that user has permission to create variant
  if (!userHasPermission(["createProduct", "product/admin", "product/create"], shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // See that parent product exists
  const parentProduct = await Products.findOne({ _id: productId, shopId });

  if (!parentProduct) {
    throw new ReactionError("not-found", "Product not found");
  }

  let product;
  let parentVariant;
  if (parentProduct.type === "variant") {
    product = await Products.findOne({ _id: parentProduct.ancestors[0], shopId });
    parentVariant = parentProduct;
  } else {
    product = parentProduct;
    parentVariant = null;
  }

  // Verify that parent is not deleted
  // Variants cannot be created on a deleted product
  if (await isAncestorDeleted(context, product, true)) {
    throw new ReactionError("server-error", "Unable to create product variant on a deleted product");
  }

  // get ancestors to build new ancestors array
  const { ancestors } = parentProduct;
  Array.isArray(ancestors) && ancestors.push(productId);

  const newVariantId = Random.id();
  const newVariant = {
    _id: newVariantId,
    ancestors,
    shopId: product.shopId,
    type: "variant"
  };

  const isOption = ancestors.length > 1;

  const createdVariantId = await createProductOrVariant(context, newVariant, { product, parentVariant, isOption });

  if (!createdVariantId) {
    throw new ReactionError("server-error", "Unable to create product variant");
  }

  Logger.debug(`createProductVariant: created variant: ${createdVariantId} for ${productId}`);

  const createdVariant = await Products.findOne({ _id: createdVariantId });

  if (!createdVariant) {
    throw new ReactionError("server-error", "Unable to retrieve newly created product variant");
  }

  return createdVariant;
}
