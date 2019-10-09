import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeFulfillmentGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

export default {
  _id: (node) => encodeFulfillmentGroupOpaqueId(node._id),
  shop: resolveShopFromShopId
};
