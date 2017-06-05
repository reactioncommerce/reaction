import { Reaction } from "/lib/api";
import { Media, Revisions } from "/lib/collections";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";


//
// define search filters as a schema so we can validate
// params supplied to the Media publication
//
const filters = new SimpleSchema({
  shops: {
    type: [String],
    optional: true
  },
  products: {
    type: [String],
    optional: true
  }
});


/**
 * CollectionFS - Image/Video Publication
 * @params {Object} mediaFilters - filters of Media (Products/Shops)
 */
Meteor.publish("Media", function (mediaFilters) {
  check(mediaFilters, Match.OneOf(undefined, filters));

  const shopId = Reaction.getSellerShopId(this.userId);
  if (!shopId) {
    return this.ready();
  }

  // Default selector gets only published brandAsset of shop (main image of shop)
  const selector = {
    "metadata.type": "brandAsset",
    "metadata.workflow": [null, "published"],
    "metadata.shopId": shopId
  };

  if (mediaFilters) {
    if (mediaFilters.products) {
      const products = mediaFilters.products;
      delete selector["metadata.type"];
      delete selector["metadata.shopId"];
      selector["metadata.productId"] = {
        $in: products
      };
    } else if (mediaFilters.shops) {
      const shops = mediaFilters.shops;
      selector["metadata.shopId"] = {
        $in: shops
      };
    }
  }

  // product editors can see published & unpublished images
  if (Reaction.hasPermission(["createProduct"], this.userId, shopId)) {
    selector["metadata.workflow"] = { $nin: ["archived"] };

    if (RevisionApi.isRevisionControlEnabled()) {
      const revisionHandle = Revisions.find({
        "documentType": "image",
        "workflow.status": { $nin: ["revision/published"] }
      }).observe({
        added: (revision) => {
          const media = Media.findOne(revision.documentId);
          if (media) {
            this.added("Media", media._id, media);
            this.added("Revisions", revision._id, revision);
          }
        },
        changed: (revision) => {
          const media = Media.findOne(revision.documentId);
          this.changed("Media", media._id, media);
          this.changed("Revisions", revision._id, revision);
        },
        removed: (revision) => {
          if (revision) {
            this.removed("Revisions", revision._id, revision);
            const media = Media.findOne(revision.documentId);
            if (media) {
              this.removed("Media", media._id, media);
            }
          }
        }
      });

      this.onStop(() => {
        revisionHandle.stop();
      });
    }
  }

  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});
