import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeGroupOpaqueId } from "../../xforms/id.js";
import createdBy from "./createdBy.js";
import createGroup from "./createGroup.js";

export default {
  _id: (node) => encodeGroupOpaqueId(node._id),
  createdBy,
  shop: resolveShopFromShopId,
  createGroup
};
