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

  let selector;
  const shopId = Reaction.getSellerShopId(this.userId);
  if (!shopId) {
    return this.ready();
  }

  if (mediaFilters) {
    if (mediaFilters.products) {
      const products = mediaFilters.products;
      selector = {
        "metadata.productId": {
          $in: products
        },
        "metadata.workflow": {
          $in: [null, "published"]
        }
      };
    } else if (mediaFilters.shops) {
      const shops = mediaFilters.shops;
      selector = {
        "metadata.shopId": {
          $in: shops
        },
        "metadata.workflow": {
          $in: [null, "published"]
        }
      };
    }
  } else {
    selector = {
      "metadata.shopId": shopId
    };

    // non product editors can only see published images
    if (!Reaction.hasPermission(["createProduct"], this.userId, shopId)) {
      selector["metadata.workflow"] = {
        $in: [null, "published"]
      };
    } else {
      // whereas ,product editors can see published & unpublished images
      selector["metadata.workflow"] = {
        $nin: ["archived"]
      };

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
  }

  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});
