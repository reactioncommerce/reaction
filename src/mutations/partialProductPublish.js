/**
 * @summary Updates `isBackorder`, `isSoldOut`, and `isLowQuantity` as necessary for
 *   a single CatalogProduct. Call this whenever inventory changes for one or more
 *   variants of a product.
 * @param {Object} context App context
 * @param {String} productId The product ID
 * @returns {undefined}
 */
export default async function partialProductPublish(context, { productId, startFrom }) {
  const { collections: { Catalog, Products, Shops } } = context;

  const catalogItem = await Catalog.findOne({ "product.productId": productId });
  if (!catalogItem) return;

  const { product: catalogProduct } = catalogItem;

  // Get some data that we pass to all publish transformation functions
  const shop = await Shops.findOne({ _id: catalogProduct.shopId });
  if (!shop) {
    throw new Error(`Cannot republish to catalog: product's shop (ID ${catalogProduct.shopId}) not found`);
  }

  const product = await Products.findOne({ _id: catalogProduct.productId });
  if (!product) {
    throw new Error(`Cannot republish to catalog: source product ${catalogProduct.productId} not found`);
  }

  const variantIds = [];
  catalogProduct.variants.forEach((catalogProductVariant) => {
    variantIds.push(catalogProductVariant.variantId);
    if (catalogProductVariant.options) {
      catalogProductVariant.options.forEach((catalogProductOption) => {
        variantIds.push(catalogProductOption.variantId);
      });
    }
  });

  const variants = await Products.find({ _id: { $in: variantIds } }).toArray();

  await context.mutations.applyCustomPublisherTransforms(context, catalogProduct, {
    product,
    shop,
    startFrom,
    variants
  });

  await Catalog.updateOne({ "product.productId": productId }, {
    $set: {
      product: catalogProduct
    }
  });
}
