import { decodeOpaqueIdForNamespace, encodeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/id";

const NAMESPACE = "reaction/mediaRecord";

export const decodeMediaRecordOpaqueId = decodeOpaqueIdForNamespace(NAMESPACE);
export const encodeMediaRecordOpaqueId = encodeOpaqueId(NAMESPACE);
