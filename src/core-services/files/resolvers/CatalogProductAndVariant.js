import xformCatalogProductMedia from "../util/xformCatalogProductMedia.js";

export default {
  media: (node, args, context) => node.media && node.media.map((mediaItem) => xformCatalogProductMedia(mediaItem, context, { shopId: node.shopId })),
  primaryImage: (node, args, context) => xformCatalogProductMedia(node.primaryImage, context, { shopId: node.shopId })
};
