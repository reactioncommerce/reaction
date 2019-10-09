import { decodeOpaqueIdForNamespace, encodeOpaqueId } from "../../../xforms/id.js";

const NAMESPACE = "reaction/mediaRecord";

export const decodeMediaRecordOpaqueId = decodeOpaqueIdForNamespace(NAMESPACE);
export const encodeMediaRecordOpaqueId = encodeOpaqueId(NAMESPACE);
