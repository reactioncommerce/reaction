import { assocOpaqueId, encodeOpaqueId } from "./id";

/* Namespace specific ID functions for Shop.
 * These functions use the power of currying to build existing functionality
 * with simple interfaces on existing functions.
 */
export const namespace = "reaction/shop";
export const encodeShopOpaqueId = encodeOpaqueId(namespace);
export const assocShopOpaqueId = assocOpaqueId(namespace);

/* Composed function that fully transforms the Shop ID for response. */
export const xformShopResponse = assocShopOpaqueId;
