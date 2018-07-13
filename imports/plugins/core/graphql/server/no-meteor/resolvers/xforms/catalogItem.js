import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocCatalogItemInternalId = assocInternalId(namespaces.CatalogItem);
export const assocCatalogItemOpaqueId = assocOpaqueId(namespaces.CatalogItem);
export const decodeCatalogItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.CatalogItem);
export const encodeCatalogItemOpaqueId = encodeOpaqueId(namespaces.CatalogItem);
