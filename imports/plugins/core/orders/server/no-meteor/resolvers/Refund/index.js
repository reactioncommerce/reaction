import { encodeRefundOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/refund";
import amount from "./amount";
import createdAt from "./createdAt";

export default {
  amount,
  createdAt
  createdAt,
  paymentId: (node) => encodePaymentOpaqueId(node.paymentId)
};
