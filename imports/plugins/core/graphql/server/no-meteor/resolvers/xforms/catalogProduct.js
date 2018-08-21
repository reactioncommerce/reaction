import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import Reaction from "/imports/plugins/core/core/server/Reaction";
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

  const { priority, toGrid, productId, variantId, URLs: { large, medium, original, small, thumbnail } } = mediaItem;
  const absoluteUrl = Reaction.absoluteUrl().slice(0, -1);
  
  return {
    priority: priority,
    toGrid: toGrid,
    productId: encodeProductOpaqueId(productId),
    variantId: encodeProductOpaqueId(variantId),
    URLs: {
      large: `${absoluteUrl}${large}`,
      medium: `${absoluteUrl}${medium}`,
      original: `${absoluteUrl}${original}`,
      small: `${absoluteUrl}${small}`,
      thumbnail: `${absoluteUrl}${thumbnail}`
    }
  };
}
