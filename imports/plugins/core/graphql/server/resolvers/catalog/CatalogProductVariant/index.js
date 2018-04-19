import { encodeCatalogProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import { encodeCatalogProductVariantOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProductVariant";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";

export default {
  _id: (node) => encodeCatalogProductVariantOpaqueId(node._id),
  ancestorIds: (node) => {
    const { ancestors } = node;

    if (ancestors.length === 1) {
      return [encodeCatalogProductOpaqueId(ancestors[0])];
    }

    if (ancestors.length === 2) {
      return [
        encodeCatalogProductOpaqueId(ancestors[0]),
        encodeCatalogProductVariantOpaqueId(ancestors[1])
      ];
    }

    return [];
  },
  variantId: (node) => encodeProductOpaqueId(node._id),
  shop: resolveShopFromShopId
};
