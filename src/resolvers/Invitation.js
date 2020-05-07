import { encodeInvitationOpaqueId } from "../xforms/id.js";

export default {
  _id: (node) => encodeInvitationOpaqueId(node._id)
}
