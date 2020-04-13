import graphqlFields from "graphql-fields";
import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import xformCatalogProductVariants from "../../utils/xformCatalogProductVariants.js";
import { encodeProductOpaqueId, encodeCatalogProductOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeCatalogProductOpaqueId(node._id),
  productId: (node) => encodeProductOpaqueId(node.productId),
  shop: resolveShopFromShopId,
  variants: (node, args, context, info) => node.variants && xformCatalogProductVariants(context, node.variants, {
    catalogProduct: node,
    fields: graphqlFields(info)
  })
};
