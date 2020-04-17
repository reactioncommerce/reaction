import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { ProductVariant } from "../simpleSchemas.js";
import cleanProductVariantInput from "../utils/cleanProductVariantInput.js";
import isAncestorDeleted from "../utils/isAncestorDeleted.js";

const inputSchema = new SimpleSchema({
  productId: String,
  shopId: String,
  variant: {
    type: Object,
    blackbox: true,
    optional: true
  }
});

/**
 * @method createProductVariant
 * @summary creates an empty variant on the product supplied
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Input arguments for the bulk operation
 * @param {String} input.productId - the product or variant ID which we create new variant on
 * @param {String} input.shopId - the shop to create the variant for
 * @param {Object} [input.variant] - variant data
 * @return {String} created variantId
 */
export default async function createProductVariant(context, input) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Products } = collections;
  const { productId, shopId, variant: productVariantInput } = input;

  // See that user has permission to create variant
  await context.validatePermissions("reaction:legacy:products", "create", { shopId });

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
  let { ancestors } = parentProduct;
  if (Array.isArray(ancestors)) {
    ancestors.push(productId);
  } else {
    ancestors = [productId];
  }

  const initialProductVariantData = await cleanProductVariantInput(context, {
    productVariantInput
  });

  if (initialProductVariantData.isDeleted) {
    throw new ReactionError("invalid-param", "Creating a deleted product variant is not allowed");
  }

  // Generate a random ID, but only if one was not passed in
  const newVariantId = (productVariantInput && productVariantInput._id) || Random.id();

  const createdAt = new Date();
  const newVariant = {
    _id: newVariantId,
    ancestors,
    createdAt,
    isDeleted: false,
    isVisible: false,
    shopId,
    type: "variant",
    updatedAt: createdAt,
    workflow: {
      status: "new"
    },
    ...initialProductVariantData
  };

  const isOption = ancestors.length > 1;

  // Apply custom transformations from plugins.
  for (const customFunc of context.getFunctionsOfType("mutateNewVariantBeforeCreate")) {
    // Functions of type "mutateNewVariantBeforeCreate" are expected to mutate the provided variant.
    // We need to run each of these functions in a series, rather than in parallel, because
    // we are mutating the same object on each pass.
    // eslint-disable-next-line no-await-in-loop
    await customFunc(newVariant, { context, isOption, parentVariant, product });
  }

  ProductVariant.validate(newVariant);

  await Products.insertOne(newVariant);

  Logger.debug(`createProductVariant: created variant: ${newVariantId} for ${productId}`);

  return newVariant;
}
