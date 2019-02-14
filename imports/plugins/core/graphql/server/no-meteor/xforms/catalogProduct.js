import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocCatalogProductInternalId = assocInternalId(namespaces.CatalogProduct);
export const assocCatalogProductOpaqueId = assocOpaqueId(namespaces.CatalogProduct);
export const decodeCatalogProductOpaqueId = decodeOpaqueIdForNamespace(namespaces.CatalogProduct);
export const encodeCatalogProductOpaqueId = encodeOpaqueId(namespaces.CatalogProduct);

/**
 * @name xformCatalogProductMedia
 * @method
 * @memberof GraphQL/Transforms
 * @summary Transforms DB media object to final GraphQL result. Calls functions plugins have registered for type
 *  "xformCatalogProductMedia". First to return an object is returned here
 * @param {Object} mediaItem Media item object. See ImageInfo SimpleSchema
 * @param {Object} context Request context
 * @return {Object|null} Transformed media item or null
 */
export async function xformCatalogProductMedia(mediaItem, context) {
  const xformCatalogProductMediaFuncs = context.getFunctionsOfType("xformCatalogProductMedia");
  for (const func of xformCatalogProductMediaFuncs) {
    const xformedMediaItem = await func(mediaItem, context);
    if (xformedMediaItem) {
      return xformedMediaItem;
    }
  }

  return null;
}
