import { encodeCatalogProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import { encodeCatalogProductVariantOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProductVariant";
import { encodeProductOpaqueId, xformPricingArray } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";

export default {
  _id: (node) => encodeCatalogProductVariantOpaqueId(node._id),
  ancestorIds: (node) => {
    const { ancestorsIds } = node;

    if (ancestorsIds.length === 1) {
      return [encodeCatalogProductOpaqueId(ancestorsIds[0])];
    }

    if (ancestorsIds.length === 2) {
      return [
        encodeCatalogProductOpaqueId(ancestorsIds[0]),
        encodeCatalogProductVariantOpaqueId(ancestorsIds[1])
      ];
    }

    return [];
  },
  variantId: (node) => encodeProductOpaqueId(node.variantId),
  shop: resolveShopFromShopId,
  pricing: (node) => xformPricingArray(node.pricing)
};
