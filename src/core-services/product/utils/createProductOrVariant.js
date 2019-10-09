import ReactionError from "@reactioncommerce/reaction-error";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";

/**
 * @function createProduct
 * @description creates a product
 * @param {Object} context - an object containing the per-request state
 * @param {Object} props - initial product properties
 * @param {Object} info - Other info
 * @returns {Object} product - new product
 */
export default async function createProduct(context, props = null, info = {}) {
  const { collections } = context;
  const { Products } = collections;

  // Make sure _id was passed as a prop
  if (!props._id) {
    throw new ReactionError("server-error", "ID required");
  }

  // Make sure shopId was passed as a prop
  if (!props.shopId) {
    throw new ReactionError("server-error", "Shop ID required");
  }

  // Add all fields that simpleSchema added by default
  const newProductOrVariant = {
    ancestors: [],
    handle: "",
    isDeleted: false,
    isVisible: false,
    shouldAppearInSitemap: true,
    supportedFulfillmentTypes: ["shipping"],
    title: "",
    type: "simple",
    workflow: {},
    ...(props || {})
  };

  if (newProductOrVariant.type === "variant") {
    // Apply custom transformations from plugins.
    for (const customFunc of context.getFunctionsOfType("mutateNewVariantBeforeCreate")) {
      // Functions of type "mutateNewVariantBeforeCreate" are expected to mutate the provided variant.
      // We need to run each of these functions in a series, rather than in parallel, because
      // we are mutating the same object on each pass.
      // eslint-disable-next-line no-await-in-loop
      await customFunc(newProductOrVariant, { context, ...info });
    }
  } else {
    // Set handle for products only, not variants
    if (!newProductOrVariant.handle) {
      if (typeof newProductOrVariant.title === "string" && newProductOrVariant.title.length) {
        newProductOrVariant.handle = getSlug(newProductOrVariant.title);
      }
    }

    // Apply custom transformations from plugins.
    for (const customFunc of context.getFunctionsOfType("mutateNewProductBeforeCreate")) {
      // Functions of type "mutateNewProductBeforeCreate" are expected to mutate the provided variant.
      // We need to run each of these functions in a series, rather than in parallel, because
      // we are mutating the same object on each pass.
      // eslint-disable-next-line no-await-in-loop
      await customFunc(newProductOrVariant, { context, ...info });
    }
  }

  const { insertedId } = await Products.insertOne(newProductOrVariant);

  return insertedId;
}
