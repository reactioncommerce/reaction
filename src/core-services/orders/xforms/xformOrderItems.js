import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name xformCatalogProductMedia
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms DB media object to final GraphQL result. Calls functions plugins have registered for type
 *  "xformCatalogProductMedia". First to return an object is returned here
 * @param {Object} mediaItem Media item object. See ImageInfo SimpleSchema
 * @param {Object} context Request context
 * @returns {Object} Transformed media item
 */
async function xformCatalogProductMedia(mediaItem, context) {
  const xformCatalogProductMediaFuncs = context.getFunctionsOfType("xformCatalogProductMedia");
  for (const func of xformCatalogProductMediaFuncs) {
    const xformedMediaItem = await func(mediaItem, context); // eslint-disable-line no-await-in-loop
    if (xformedMediaItem) {
      return xformedMediaItem;
    }
  }

  return mediaItem;
}

/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object} item The order fulfillment group item in DB format
 * @param {Object[]} catalogItems Array of CatalogItem docs from the db
 * @param {Object[]} products Array of Product docs from the db
 * @returns {Object} Same object with GraphQL-only props added
 */
async function xformOrderItem(context, item, catalogItems) {
  const { productId, variantId } = item;

  const catalogItem = catalogItems.find((cItem) => cItem.product.productId === productId);
  if (!catalogItem) {
    throw new ReactionError("not-found", `CatalogProduct with product ID ${productId} not found`);
  }

  const catalogProduct = catalogItem.product;

  const { variant } = context.queries.findVariantInCatalogProduct(catalogProduct, variantId);
  if (!variant) {
    throw new ReactionError("invalid-param", `Product with ID ${productId} has no variant with ID ${variantId}`);
  }

  // Find one image from the catalog to use for the item.
  // Prefer the first variant image. Fallback to the first product image.
  let media;
  if (variant.media && variant.media.length) {
    [media] = variant.media;
  } else if (catalogProduct.media && catalogProduct.media.length) {
    media = catalogProduct.media.find((mediaItem) => mediaItem.variantId === variantId);
    if (!media) [media] = catalogProduct.media;
  }

  // Allow plugins to transform the media object
  if (media) {
    media = await xformCatalogProductMedia(media, context);
  }

  return {
    ...item,
    imageURLs: media && media.URLs,
    productConfiguration: {
      productId: item.productId,
      productVariantId: item.variantId
    },
    subtotal: {
      amount: item.subtotal,
      currencyCode: item.price.currencyCode
    }
  };
}

/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object[]} items Array of order fulfillment group items
 * @returns {Object[]} Same array with GraphQL-only props added
 */
export default async function xformOrderItems(context, items) {
  const { collections } = context;
  const { Catalog } = collections;

  const productIds = items.map((item) => item.productId);

  const catalogItems = await Catalog.find({
    "product.productId": {
      $in: productIds
    },
    "product.isVisible": true,
    "product.isDeleted": { $ne: true },
    "isDeleted": { $ne: true }
  }).toArray();

  return Promise.all(items.map((item) => xformOrderItem(context, item, catalogItems)));
}
