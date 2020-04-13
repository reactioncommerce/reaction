import getCatalogProductMedia from "./getCatalogProductMedia.js";

/**
 * @summary Adds media property to the product object before it is hashed.
 *   This makes media changes result in a product being marked as in need
 *   of republishing.
 * @param {Object} context App context
 * @param {Object} info Info object
 * @param {Object} info.productForHashing Product object that will be hashed and may be mutated.
 * @param {Object} info.product The full Product entity
 * @return {Promise<undefined>} Mutates but does not return anything
 */
export default async function mutateProductHashObjectAddMedia(context, { productForHashing, product }) {
  productForHashing.media = await getCatalogProductMedia(product._id, context.collections);
}
