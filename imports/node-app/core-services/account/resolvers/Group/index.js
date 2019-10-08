import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import createdBy from "./createdBy.js";

export default {
  _id: (node) => encodeGroupOpaqueId(node._id),
  createdBy,
  shop: resolveShopFromShopId
};
