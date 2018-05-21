import { encodeCatalogProductVariantOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProductVariant";
import { encodeProductOpaqueId, xformPricingArray } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";

export default {
  _id: (node) => encodeCatalogProductVariantOpaqueId(node._id),
  variantId: (node) => encodeProductOpaqueId(node.variantId),
  shop: resolveShopFromShopId,
  pricing: (node) => xformPricingArray(node.pricing)
};
