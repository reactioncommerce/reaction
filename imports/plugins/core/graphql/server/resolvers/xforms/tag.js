import { getPaginatedResponse, namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocTagsInternalId = assocInternalId(namespaces.Tag);
export const assocTagsOpaqueId = assocOpaqueId(namespaces.Tag);
export const decodeTagsOpaqueId = decodeOpaqueIdForNamespace(namespaces.Tag);
export const encodeTagsOpaqueId = encodeOpaqueId(namespaces.Tag);

export const getPaginatedTagsResponse = getPaginatedResponse(null);
