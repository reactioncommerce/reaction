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
 * @param {Object[]} catalogItems Array of CatalogItem docs from the db
 * @param {Object[]} products Array of Product docs from the db
 * @param {Object} cartItem CartItem
 * @returns {Object} Same object with GraphQL-only props added
 */
async function xformCartItem(context, catalogItems, products, cartItem) {
  const { productId, variantId } = cartItem;

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
    ...cartItem,
    imageURLs: media && media.URLs,
    productConfiguration: {
      productId: cartItem.productId,
      productVariantId: cartItem.variantId
    }
  };
}

/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object[]} items Array of CartItem
 * @returns {Object[]} Same array with GraphQL-only props added
 */
export default async function xformCartItems(context, items) {
  const { collections, getFunctionsOfType } = context;
  const { Catalog, Products } = collections;

  const productIds = items.map((item) => item.productId);

  const catalogItems = await Catalog.find({
    "product.productId": {
      $in: productIds
    },
    "product.isVisible": true,
    "product.isDeleted": { $ne: true },
    "isDeleted": { $ne: true }
  }).toArray();

  const products = await Products.find({
    ancestors: {
      $in: productIds
    }
  }).toArray();

  const xformedItems = await Promise.all(items.map((item) => xformCartItem(context, catalogItems, products, item)));

  for (const mutateItems of getFunctionsOfType("xformCartItems")) {
    await mutateItems(context, xformedItems); // eslint-disable-line no-await-in-loop
  }

  return xformedItems;
}
