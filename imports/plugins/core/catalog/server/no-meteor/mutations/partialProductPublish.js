import { applyCustomPublisherTransforms } from "../utils/applyCustomPublisherTransforms";

/**
 * @summary Updates `isBackorder`, `isSoldOut`, and `isLowQuantity` as necessary for
 *   a single CatalogProduct. Call this whenever inventory changes for one or more
 *   variants of a product.
 * @param {Object} context App context
 * @param {String} productId The product ID
 * @return {undefined}
 */
export default async function partialProductPublish(context, { productId, startFrom }) {
  const { collections: { Catalog } } = context;

  const catalogItem = await Catalog.findOne({ "product.productId": productId });
  const { product: catalogProduct } = catalogItem;

  await applyCustomPublisherTransforms(catalogProduct, context, startFrom);

  await Catalog.updateOne({ "product.productId": productId }, {
    $set: {
      product: catalogProduct
    }
  });
}
