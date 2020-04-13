import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeCatalogProductVariantOpaqueId, encodeProductOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeCatalogProductVariantOpaqueId(node._id),
  shop: resolveShopFromShopId,
  variantId: (node) => encodeProductOpaqueId(node.variantId)
};
