import { encodeCatalogProductOpaqueId, xformCatalogProductMedia } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import pricing from "./pricing";
import tagIds from "./tagIds";
import tags from "./tags";

export default {
  _id: (node) => encodeCatalogProductOpaqueId(node._id),
  productId: (node) => encodeProductOpaqueId(node.productId),
  shop: resolveShopFromShopId,
  pricing,
  tagIds,
  tags,
  media: (node, args, context) => node.media && node.media.map((mediaItem) => xformCatalogProductMedia(mediaItem, context)),
  primaryImage: (node, args, context) => xformCatalogProductMedia(node.primaryImage, context),
  variants: (node, args, context) => node.variants && node.variants.map((variant) => {
    variant.media = variant.media && variant.media.map((mediaItem) => xformCatalogProductMedia(mediaItem, context));
    variant.primaryImage = xformCatalogProductMedia(variant.primaryImage, context);

    if (variant.options) {
      variant.options = variant.options.map((option) => {
        option.media = option.media && option.media.map((mediaItem) => xformCatalogProductMedia(mediaItem, context));
        option.primaryImage = xformCatalogProductMedia(option.primaryImage, context);
        return option;
      });
    }

    return variant;
  })
};
