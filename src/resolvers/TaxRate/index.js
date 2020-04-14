import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeTaxRateOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeTaxRateOpaqueId(node._id),
  shop: resolveShopFromShopId,
  sourcing: (node) => node.taxLocale
};
