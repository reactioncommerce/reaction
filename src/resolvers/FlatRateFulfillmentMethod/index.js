import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeFulfillmentMethodOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeFulfillmentMethodOpaqueId(node._id),
  shop: resolveShopFromShopId,
  isEnabled: (node) => !!node.enabled
};
