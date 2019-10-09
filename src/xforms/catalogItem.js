import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocCatalogItemInternalId = assocInternalId(namespaces.CatalogItem);
export const assocCatalogItemOpaqueId = assocOpaqueId(namespaces.CatalogItem);
export const decodeCatalogItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.CatalogItem);
export const encodeCatalogItemOpaqueId = encodeOpaqueId(namespaces.CatalogItem);
