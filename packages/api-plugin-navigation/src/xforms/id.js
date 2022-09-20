import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  NavigationItem: "reaction/navigationItem",
  NavigationTree: "reaction/navigationTree",
  Shop: "reaction/shop"
};

export const encodeNavigationItemOpaqueId = encodeOpaqueId(namespaces.NavigationItem);
export const encodeNavigationTreeOpaqueId = encodeOpaqueId(namespaces.NavigationTree);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeNavigationItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.NavigationItem);
export const decodeNavigationTreeOpaqueId = decodeOpaqueIdForNamespace(namespaces.NavigationTree);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
