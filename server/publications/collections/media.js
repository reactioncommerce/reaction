import { Media, Revisions } from "/lib/collections";
import { Reaction } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";


/**
 * CollectionFS - Image/Video Publication
 * @params {Array} shops - array of current shop object
 */
Meteor.publish("Media", function (shops) {
  check(shops, Match.Optional(Array));
  let selector;
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  if (shopId) {
    selector = {
      "metadata.shopId": shopId
    };
  }
  if (shops) {
    selector = {
      "metadata.shopId": {
        $in: shops
      }
    };
  }

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

  return Media.find({
    "metadata.type": "brandAsset"
  });
});
