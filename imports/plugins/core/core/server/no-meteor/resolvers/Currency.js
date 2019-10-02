import encodeOpaqueId from "@reactioncommerce/api-utils/graphql/encodeOpaqueId.js";

export default {
  _id: (node) => encodeOpaqueId("reaction/currency", node._id)
};
