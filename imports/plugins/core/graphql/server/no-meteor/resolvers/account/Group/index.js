import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import createdBy from "./createdBy";

export default {
  _id: (node) => encodeGroupOpaqueId(node._id),
  createdBy,
  shop: resolveShopFromShopId
};
