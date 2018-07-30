import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";
import findVariantInCatalogProduct from "/imports/plugins/core/catalog/server/no-meteor/utils/findVariantInCatalogProduct";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";
import { decodeProductOpaqueId } from "./product";

export const assocCartInternalId = assocInternalId(namespaces.Cart);
export const assocCartOpaqueId = assocOpaqueId(namespaces.Cart);
export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
export const encodeCartOpaqueId = encodeOpaqueId(namespaces.Cart);

export const assocCartItemInternalId = assocInternalId(namespaces.CartItem);
export const assocCartItemOpaqueId = assocOpaqueId(namespaces.CartItem);
export const decodeCartItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.CartItem);
export const encodeCartItemOpaqueId = encodeOpaqueId(namespaces.CartItem);

/**
 * @param {Object[]} items Array of CartItemInput
 * @return {Object[]} Same array with all IDs transformed to internal
 */
export function decodeCartItemsOpaqueIds(items) {
  return items.map((item) => ({
    ...item,
    productConfiguration: {
      productId: decodeProductOpaqueId(item.productConfiguration.productId),
      productVariantId: decodeProductOpaqueId(item.productConfiguration.productVariantId)
    }
  }));
}

/**
 * @param {Object[]} catalogItems Array of CatalogItem docs from the db
 * @param {Object} cartItem CartItem
 * @return {Object} Same object with GraphQL-only props added
 */
function xformCartItem(catalogItems, cartItem) {
  const { priceWhenAdded, productId, variantId } = cartItem;
  const { currencyCode } = priceWhenAdded;

  const catalogItem = catalogItems.find((cItem) => cItem.product.productId === productId);
  if (!catalogItem) {
    throw new ReactionError("not-found", `CatalogProduct with product ID ${productId} not found`);
  }

  const catalogProduct = catalogItem.product;
  const { variant } = findVariantInCatalogProduct(catalogProduct, variantId);
  if (!variant) {
    throw new ReactionError("invalid-param", `Product with ID ${productId} has no variant with ID ${variantId}`);
  }

  const variantPriceInfo = variant.pricing[currencyCode];
  if (!variantPriceInfo) {
    throw new ReactionError("invalid-param", `This product variant does not have a price for ${currencyCode}`);
  }

  let media;
  if (catalogProduct.media) {
    media = catalogProduct.media.find((mediaItem) => mediaItem.variantId === variantId);
    if (!media) [media] = catalogProduct.media;
  }

  return {
    ...cartItem,
    compareAtPrice: {
      amount: variantPriceInfo.compareAtPrice,
      currencyCode
    },
    currentQuantity: variant.quantity,
    imageURLs: media && media.URLs,
    isBackorder: variant.isBackorder || false,
    isLowQuantity: variant.isLowQuantity || false,
    isSoldOut: variant.isSoldOut || false,
    price: {
      amount: variantPriceInfo.price,
      currencyCode
    },
    productConfiguration: {
      productId: cartItem.productId,
      productVariantId: cartItem.variantId
    }
  };
}

/**
 * @param {Object} collections Map of raw collections
 * @param {Object[]} items Array of CartItem
 * @return {Object[]} Same array with GraphQL-only props added
 */
export async function xformCartItems(collections, items) {
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

  return items.map((item) => xformCartItem(catalogItems, item));
}
