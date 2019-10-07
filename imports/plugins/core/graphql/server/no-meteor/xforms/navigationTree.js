import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocNavigationTreeInternalId = assocInternalId(namespaces.NavigationTree);
export const assocNavigationTreeOpaqueId = assocOpaqueId(namespaces.NavigationTree);
export const decodeNavigationTreeOpaqueId = decodeOpaqueIdForNamespace(namespaces.NavigationTree);
export const encodeNavigationTreeOpaqueId = encodeOpaqueId(namespaces.NavigationTree);
