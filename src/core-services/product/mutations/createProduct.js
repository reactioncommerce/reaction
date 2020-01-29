import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import { Product } from "../simpleSchemas.js";

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
  const { collections } = context;
  const { Products } = collections;
  const { shopId } = input;

  // Check that user has permission to create product
  await context.validatePermissions("reaction:legacy:products", "create", { shopId });

  const newProductId = Random.id();
  const createdAt = new Date();
  const newProduct = {
    _id: newProductId,
    ancestors: [],
    createdAt,
    handle: "",
    isDeleted: false,
    isVisible: false,
    shopId,
    shouldAppearInSitemap: true,
    supportedFulfillmentTypes: ["shipping"],
    title: "",
    type: "simple",
    updatedAt: createdAt,
    workflow: {
      status: "new"
    }
  };

  // Apply custom transformations from plugins.
  for (const customFunc of context.getFunctionsOfType("mutateNewProductBeforeCreate")) {
    // Functions of type "mutateNewProductBeforeCreate" are expected to mutate the provided variant.
    // We need to run each of these functions in a series, rather than in parallel, because
    // we are mutating the same object on each pass.
    // eslint-disable-next-line no-await-in-loop
    await customFunc(newProduct, { context });
  }

  Product.validate(newProduct);

  await Products.insertOne(newProduct);

  // Create one initial product variant for it
  await context.mutations.createProductVariant(context.getInternalContext(), {
    productId: newProductId,
    shopId
  });

  return newProduct;
}
