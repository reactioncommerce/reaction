import { createRequire } from "module";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const require = createRequire(import.meta.url);

const { assoc, curry } = require("ramda");

const namespaces = {
  Account: "reaction/account",
  Address: "reaction/address",
  Group: "reaction/group",
  Invitation: "reaction/invitation",
  Shop: "reaction/shop"
};

export const encodeAccountOpaqueId = encodeOpaqueId(namespaces.Account);
export const encodeAddressOpaqueId = encodeOpaqueId(namespaces.Address);
export const encodeGroupOpaqueId = encodeOpaqueId(namespaces.Group);
export const encodeInvitationOpaqueId = encodeOpaqueId(namespaces.Invitation);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeAccountOpaqueId = decodeOpaqueIdForNamespace(namespaces.Account);
export const decodeAddressOpaqueId = decodeOpaqueIdForNamespace(namespaces.Address);
export const decodeGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.Group);
export const decodeInvitationOpaqueId = decodeOpaqueIdForNamespace(namespaces.Invitation);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);

/**
 * @name assocInternalId
 * @method
 * @memberof GraphQL/Transforms
 * @summary Assoc an internal ID onto an object by decoding its existing opaque _id
 *   Assumes key is _id but key could be provided as another curried param.
 * @param {String} namespace The namespace
 * @param {Object} item An object with _id property
 */
export const assocInternalId = curry((namespace, item) =>
  assoc("_id", decodeOpaqueIdForNamespace(namespace, item._id), item));

export const assocAddressInternalId = assocInternalId(namespaces.Address);
