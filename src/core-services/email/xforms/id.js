import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Job: "reaction/job"
};

export const encodeJobOpaqueId = encodeOpaqueId(namespaces.Job);
export const decodeJobOpaqueId = decodeOpaqueIdForNamespace(namespaces.Job);
