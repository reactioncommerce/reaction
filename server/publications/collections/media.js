import { Meteor } from "meteor/meteor";
import { Media, Revisions } from "/lib/collections";
import { Reaction } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";


/**
 * CollectionFS - Brand asset publication
  */
Meteor.publish("Media", function () {
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  if (RevisionApi.isRevisionControlEnabled()) {
    const revisionHandle = Revisions.find({
      "documentType": "image",
      "workflow.status": { $nin: [ "revision/published"] }
    }).observe({
      added: (revision) => {
        const media = Media.findOne(revision.documentId);
        if (media) {
          console.log(`media.js: Add media ${media._id} and revision ${revision._id}`);
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
