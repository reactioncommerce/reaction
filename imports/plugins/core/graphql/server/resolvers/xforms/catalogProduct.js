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
 * @return transformed product media array
 */
export function xformProductMedia(mediaItem) {
  if (!mediaItem) return null;

  const { metadata, large, medium, image, small, thumbnail } = mediaItem;

  return {
    priority: metadata && metadata.priority,
    toGrid: metadata && metadata.toGrid,
    productId: encodeProductOpaqueId(metadata && metadata.productId),
    variantId: encodeProductOpaqueId(metadata && metadata.variantId),
    URLs: {
      large,
      medium,
      original: image,
      small,
      thumbnail
    }
  };
}
