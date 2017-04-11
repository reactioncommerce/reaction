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

  if (mediaFilters && mediaFilters.products) {
    const products = mediaFilters.products;
    selector = {
      "metadata.productId": {
        $in: products
      },
      "metadata.workflow": {
        $in: [null, "published"]
      }
    };
  } else if (mediaFilters && mediaFilters.shops) {
    shops = mediaFilters.shops;
    selector = {
      "metadata.shopId": {
        $in: shops
      },
      "metadata.workflow": {
        $in: [null, "published"]
      }
    };
  } else {
    selector = {
      "metadata.shopId": shopId
    };

    // Product editors can see both published and unpublished images
    if (!Reaction.hasPermission(["createProduct"], this.userId)) {
      selector["metadata.workflow"] = {
        $in: [null, "published"]
      };
    } else {
      // but no one gets to see archived images
      selector["metadata.workflow"] = {
        $nin: ["archived"]
      };
    }

    if (RevisionApi.isRevisionControlEnabled()) {
      const revisionHandle = Revisions.find({
        "documentType": "image",
        "workflow.status": { $nin: [ "revision/published"] }
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
            const media = Media.findOne(revision.documentId);
            if (media) {
              this.removed("Media", media._id, media);
              this.removed("Revisions", revision._id, revision);
            }
          }
        }
      });

      this.onStop(() => {
        revisionHandle.stop();
      });
    }
  }

  return Media.find({
    "metadata.type": "brandAsset"
  });
});
