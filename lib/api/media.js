import { each } from "lodash";
import { Media, Revisions } from "/lib/collections";

export function getProductMedia({ productId, getRevisions }) {
  const selector = {
    $or: [
      { "metadata.productId": productId },
      { "metadata.variantId": productId }
    ]
  };

  if (getRevisions !== true) {
    selector["metadata.workflow"] = "published";
  }

  const productMedia = Media.find(selector, {
    sort: { "metadata.priority": 1, "uploadedAt": 1 }
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
      name: mediaItem.original.name,
      images,
      metadata: {
        productId: mediaItem.metadata.productId,
        variantId: mediaItem.metadata.variantId,
        shopId: mediaItem.metadata.shopId,
        priority: mediaItem.metadata.priority,
        toGrid: mediaItem.metadata.toGrid
      }
    };
  });

  if (getRevisions) {
    return appendRevisionsToMedia(productId, productMedia);
  }

  return productMedia;
}

export function fetchMediaRevisions(productId) {
  const mediaRevisions = Revisions.find({
    "parentDocument": productId,
    "documentType": "image",
    "workflow.status": {
      $nin: ["revision/published"]
    }
  }).fetch();

  return mediaRevisions;
}

// resort the media in
export function sortMedia(media) {
  const sortedMedia = _.sortBy(media, function (m) {
    return m.metadata.priority;
  });

  return sortedMedia;
}

// Search through revisions and if we find one for the image, stick it on the object
export function appendRevisionsToMedia(productId, media) {
  const mediaRevisions = fetchMediaRevisions(productId);
  const newMedia = [];

  for (const image of media) {
    image.revision = undefined;

    for (const revision of mediaRevisions) {
      if (revision.documentId === image._id) {
        image.revision = revision;
        image.metadata.priority = revision.documentData.priority;
      }
    }

    newMedia.push(image);
  }

  return sortMedia(newMedia);
}
