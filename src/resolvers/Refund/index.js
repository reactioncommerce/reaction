import { encodePaymentOpaqueId, encodeRefundOpaqueId } from "../../xforms/id.js";
import amount from "./amount.js";
import createdAt from "./createdAt.js";

export default {
  _id: (node) => encodeRefundOpaqueId(node._id),
  amount,
  createdAt,
  paymentId: (node) => encodePaymentOpaqueId(node.paymentId)
};
