import graphqlFields from "graphql-fields";
import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import xformCatalogProductMedia from "../../utils/xformCatalogProductMedia.js";
import xformCatalogProductVariants from "../../utils/xformCatalogProductVariants.js";
import { encodeProductOpaqueId, encodeCatalogProductOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeCatalogProductOpaqueId(node._id),
  media: (node, args, context) => node.media && node.media.map((mediaItem) => xformCatalogProductMedia(mediaItem, context)),
  primaryImage: (node, args, context) => xformCatalogProductMedia(node.primaryImage, context),
  productId: (node) => encodeProductOpaqueId(node.productId),
  shop: resolveShopFromShopId,
  variants: (node, args, context, info) => node.variants && xformCatalogProductVariants(context, node.variants, {
    catalogProduct: node,
    fields: graphqlFields(info)
  })
};
