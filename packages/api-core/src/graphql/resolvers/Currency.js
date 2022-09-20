import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

export default {
  _id: (node) => encodeOpaqueId("reaction/currency", node._id)
};
