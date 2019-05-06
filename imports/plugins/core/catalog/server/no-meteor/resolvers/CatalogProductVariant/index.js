import { encodeCatalogProductVariantOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProductVariant";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import { xformCatalogProductMedia } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";

export default {
  _id: (node) => encodeCatalogProductVariantOpaqueId(node._id),
  variantId: (node) => encodeProductOpaqueId(node.variantId),
  shop: resolveShopFromShopId,
  media: (node, args, context) => node.media && node.media.map((mediaItem) => xformCatalogProductMedia(mediaItem, context)),
  primaryImage: (node, args, context) => xformCatalogProductMedia(node.primaryImage, context)
};
