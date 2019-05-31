import { encodePaymentOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/payment";

export default {
  _id: (node) => encodePaymentOpaqueId(node._id)
};
