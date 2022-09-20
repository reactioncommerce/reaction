import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import createHandle from "./createHandle.js";

const productFieldsThatShouldNotBeDirectlySet = [
  "_id",
  "ancestors",
  "createdAt",
  "currentProductHash",
  "parcel",
  "publishedAt",
  "publishedProductHash",
  "shopId",
  "type",
  "workflow"
];

/**
 * @summary Copies and cleans the ProductInput object accepted by the
 *   createProduct and updateProduct mutations.
 * @param {Object} context App context
 * @param {Object} input Function input
 * @param {String} [input.currentProductHandle] Current handle, if this is
 *   an update and there is one
 * @param {Object} input.productId Product ID for use by `createHandle`
 * @param {Object} input.productInput ProductInput object to clean
 * @param {Object} input.shopId Shop ID for use by `createHandle`
 * @return {Promise<Object>} Cleaned ProductInput
 */
export default async function cleanProductInput(context, {
  currentProductHandle,
  productId,
  productInput,
  shopId
}) {
  const input = { ...productInput };

  // Slugify the handle input
  if (typeof input.slug === "string") {
    input.handle = await createHandle(context, getSlug(input.slug), productId, shopId);
    delete input.slug;
  }

  // If a title is supplied, and the currently stored product doesn't have a handle,
  // then slugify the title and save it as the new handle (slug)
  if (typeof input.title === "string" && !currentProductHandle && !input.handle) {
    input.handle = await createHandle(context, getSlug(input.title), productId, shopId);
  }

  // Product.validate call will ensure most validity, but there are certain fields
  // that we never want to allow arbitrary values for because they are controlled by the
  // system. We'll clear those here if someone is trying to set them.
  productFieldsThatShouldNotBeDirectlySet.forEach((forbiddenField) => {
    delete input[forbiddenField];
  });

  return input;
}
