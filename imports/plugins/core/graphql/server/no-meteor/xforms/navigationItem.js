import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocNavigationItemInternalId = assocInternalId(namespaces.NavigationItem);
export const assocNavigationItemOpaqueId = assocOpaqueId(namespaces.NavigationItem);
export const decodeNavigationItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.NavigationItem);
export const encodeNavigationItemOpaqueId = encodeOpaqueId(namespaces.NavigationItem);
