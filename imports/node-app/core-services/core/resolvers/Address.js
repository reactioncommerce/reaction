import { encodeAddressOpaqueId } from "../xforms/id.js";

export default {
  _id: (node) => encodeAddressOpaqueId(node._id)
};
