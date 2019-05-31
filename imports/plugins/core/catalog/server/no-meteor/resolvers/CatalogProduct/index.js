import graphqlFields from "graphql-fields";
import { encodeCatalogProductOpaqueId, xformCatalogProductMedia } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import xformCatalogProductVariants from "../../utils/xformCatalogProductVariants";
import tagIds from "./tagIds";
import tags from "./tags";

export default {
  _id: (node) => encodeCatalogProductOpaqueId(node._id),
  media: (node, args, context) => node.media && node.media.map((mediaItem) => xformCatalogProductMedia(mediaItem, context)),
  primaryImage: (node, args, context) => xformCatalogProductMedia(node.primaryImage, context),
  productId: (node) => encodeProductOpaqueId(node.productId),
  shop: resolveShopFromShopId,
  tagIds,
  tags,
  variants: (node, args, context, info) => node.variants && xformCatalogProductVariants(context, node.variants, {
    catalogProduct: node,
    fields: graphqlFields(info)
  })
};
