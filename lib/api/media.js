import { each } from "lodash";
import { Media } from "/lib/collections";

export function getProductMedia(productId, variantId) {
  return Media.find({
    "$or": [
      { "metadata.productId": productId },
      { "metadata.variantId": variantId }
    ],
    "metadata.workflow": "published"
  }).map((mediaItem) => {
    const images = {};

    each(mediaItem.copies, (copy, store) => {
      images[store] = {
        name: copy.name,
        type: copy.type,
        size: copy.size,
        url: mediaItem.url({ store })
      };
    });

    return {
      ...mediaItem,
      name: mediaItem.original.name,
      images
    };
  });
}
