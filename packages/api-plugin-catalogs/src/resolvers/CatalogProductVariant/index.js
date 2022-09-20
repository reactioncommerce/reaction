import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import xformCatalogProductMedia from "../../utils/xformCatalogProductMedia.js";
import { encodeCatalogProductVariantOpaqueId, encodeProductOpaqueId } from "../../xforms/id.js";

export default {
  _id: (node) => encodeCatalogProductVariantOpaqueId(node._id),
  media: (node, args, context) => node.media && node.media.map((mediaItem) => xformCatalogProductMedia(mediaItem, context)),
  primaryImage: (node, args, context) => xformCatalogProductMedia(node.primaryImage, context),
  shop: resolveShopFromShopId,
  variantId: (node) => encodeProductOpaqueId(node.variantId)
};
