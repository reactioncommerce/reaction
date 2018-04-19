import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocTagInternalId = assocInternalId(namespaces.Tag);
export const assocTagOpaqueId = assocOpaqueId(namespaces.Tag);
export const decodeTagOpaqueId = decodeOpaqueIdForNamespace(namespaces.Tag);
export const encodeTagOpaqueId = encodeOpaqueId(namespaces.Tag);
