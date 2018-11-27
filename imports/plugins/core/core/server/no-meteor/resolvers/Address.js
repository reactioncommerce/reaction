import { encodeAddressOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/address";

export default {
  _id: (node) => encodeAddressOpaqueId(node._id)
};
