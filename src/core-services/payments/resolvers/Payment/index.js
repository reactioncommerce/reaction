import { encodePaymentOpaqueId } from "../../../../xforms/payment.js";

export default {
  _id: (node) => encodePaymentOpaqueId(node._id)
};
