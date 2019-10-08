import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocNavigationItemInternalId = assocInternalId(namespaces.NavigationItem);
export const assocNavigationItemOpaqueId = assocOpaqueId(namespaces.NavigationItem);
export const decodeNavigationItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.NavigationItem);
export const encodeNavigationItemOpaqueId = encodeOpaqueId(namespaces.NavigationItem);
