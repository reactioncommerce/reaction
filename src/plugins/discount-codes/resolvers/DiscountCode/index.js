import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeDiscountOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeDiscountOpaqueId(node._id),
  shop: resolveShopFromShopId
};
