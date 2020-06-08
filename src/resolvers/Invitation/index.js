import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeInvitationOpaqueId } from "../../xforms/id.js";
import invitedBy from "./invitedBy.js";

export default {
  _id: (node) => encodeInvitationOpaqueId(node._id),
  groups: (parent, _, context) => context.queries.groupsById(context, parent.groupIds || [parent.groupId]),
  invitedBy,
  shop: resolveShopFromShopId
};
