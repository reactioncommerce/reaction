import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeFulfillmentGroupOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeFulfillmentGroupOpaqueId(node._id),
  shop: resolveShopFromShopId
};
