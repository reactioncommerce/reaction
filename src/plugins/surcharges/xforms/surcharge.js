import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "../../../xforms/id.js";

const namespace = "reaction/surcharge";

export const assocSurchargeInternalId = assocInternalId(namespace);
export const assocSurchargeOpaqueId = assocOpaqueId(namespace);
export const decodeSurchargeOpaqueId = decodeOpaqueIdForNamespace(namespace);
export const encodeSurchargeOpaqueId = encodeOpaqueId(namespace);
