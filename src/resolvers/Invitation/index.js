import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeInvitationOpaqueId } from "../../xforms/id.js";
import groups from "./groups.js";
import invitedBy from "./invitedBy.js";

export default {
  _id: (node) => encodeInvitationOpaqueId(node._id),
  groups,
  invitedBy,
  shop: resolveShopFromShopId
};
