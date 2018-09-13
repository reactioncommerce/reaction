import { encodeCatalogProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import { encodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import { xformProductMedia } from "../../xforms/catalogProduct";
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
  media: (node, args, context) => node.media && node.media.map((mediaItem) => xformProductMedia(mediaItem, context)),
  primaryImage: (node, args, context) => xformProductMedia(node.primaryImage, context),
  variants: (node, args, context) => node.variants && node.variants.map((variant) => {
    variant.media = variant.media && variant.media.map((mediaItem) => xformProductMedia(mediaItem, context));
    variant.primaryImage = xformProductMedia(variant.primaryImage, context);

    if (variant.options) {
      variant.options = variant.options.map((option) => {
        option.media = option.media && option.media.map((mediaItem) => xformProductMedia(mediaItem, context));
        option.primaryImage = xformProductMedia(option.primaryImage, context);
        return option;
      });
    }

    return variant;
  })
};
