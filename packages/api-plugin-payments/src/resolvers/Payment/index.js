import { encodePaymentOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodePaymentOpaqueId(node._id)
};
