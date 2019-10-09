import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocCatalogProductVariantInternalId = assocInternalId(namespaces.CatalogProductVariant);
export const assocCatalogProductVariantOpaqueId = assocOpaqueId(namespaces.CatalogProductVariant);
export const decodeCatalogProductVariantOpaqueId = decodeOpaqueIdForNamespace(namespaces.CatalogProductVariant);
export const encodeCatalogProductVariantOpaqueId = encodeOpaqueId(namespaces.CatalogProductVariant);
