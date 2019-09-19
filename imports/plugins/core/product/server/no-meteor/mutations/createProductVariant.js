import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import createProductOrVariant from "../utils/createProductOrVariant";
import isAncestorDeleted from "../utils/isAncestorDeleted";

const inputSchema = new SimpleSchema({
  parentId: String
});

/**
 * @method createProductVariant
 * @summary creates an empty variant on the product supplied
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.parentId - the product or variant ID which we create new variant on
 * @return {String} created variantId
 */
export default async function createProductVariant(context, input) {
  inputSchema.validate(input);
  const { collections, userHasPermission } = context;
  const { Products } = collections;
  const { parentId } = input;

  // See that parent product exists
  const parentProduct = await Products.findOne({ _id: parentId });

  if (!parentProduct) {
    throw new ReactionError("not-found", "Product not found");
  }

  let product;
  let parentVariant;
  if (parentProduct.type === "variant") {
    product = await Products.findOne({ _id: parentProduct.ancestors[0] });
    parentVariant = parentProduct;
  } else {
    product = parentProduct;
    parentVariant = null;
  }

  // See that user has permission to create variant
  if (!userHasPermission(["createProduct", "product/admin", "product/create"], product.shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Verify that parent is not deleted
  // Variants cannot be created on a deleted product
  if (await isAncestorDeleted(context, product, true)) {
    throw new ReactionError("server-error", "Unable to create product variant on a deleted product");
  }

  // get ancestors to build new ancestors array
  const { ancestors } = parentProduct;
  Array.isArray(ancestors) && ancestors.push(parentId);

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

  Logger.debug(`createProductVariant: created variant: ${createdVariantId} for ${parentId}`);

  const createdVariant = await Products.findOne({ _id: createdVariantId });

  if (!createdVariant) {
    throw new ReactionError("server-error", "Unable to retrieve newly created product variant");
  }

  return createdVariant;
}
