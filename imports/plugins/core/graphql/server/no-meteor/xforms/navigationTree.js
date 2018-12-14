import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocNavigationTreeInternalId = assocInternalId(namespaces.NavigationTree);
export const assocNavigationTreeOpaqueId = assocOpaqueId(namespaces.NavigationTree);
export const decodeNavigationTreeOpaqueId = decodeOpaqueIdForNamespace(namespaces.NavigationTree);
export const encodeNavigationTreeOpaqueId = encodeOpaqueId(namespaces.NavigationTree);
