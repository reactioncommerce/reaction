import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { encodeProductOpaqueId } from "./product";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocCatalogProductInternalId = assocInternalId(namespaces.CatalogProduct);
export const assocCatalogProductOpaqueId = assocOpaqueId(namespaces.CatalogProduct);
export const decodeCatalogProductOpaqueId = decodeOpaqueIdForNamespace(namespaces.CatalogProduct);
export const encodeCatalogProductOpaqueId = encodeOpaqueId(namespaces.CatalogProduct);

/**
 * @name xformProductMedia
 * @method
 * @memberof GraphQL/Transforms
 * @param {Object} mediaItem object from a catalog product
 * @param {Object} context - an object containing the per-request state
 * @return {Object} transformed product media item
 */
export function xformProductMedia(mediaItem, context) {
  if (!mediaItem) return null;

  const { priority, toGrid, productId, variantId, URLs: { large, medium, original, small, thumbnail } } = mediaItem;

  return {
    priority,
    toGrid,
    productId,
    variantId,
    URLs: {
      large: context.getAbsoluteUrl(large),
      medium: context.getAbsoluteUrl(medium),
      original: context.getAbsoluteUrl(original),
      small: context.getAbsoluteUrl(small),
      thumbnail: context.getAbsoluteUrl(thumbnail)
    }
  };
}
