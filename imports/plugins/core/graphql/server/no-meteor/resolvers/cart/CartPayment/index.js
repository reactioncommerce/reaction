import { encodeCartPaymentOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

export default {
  _id: (node) => encodeCartPaymentOpaqueId(node._id)
};
