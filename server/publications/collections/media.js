import { Media, Revisions } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
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

  if (!Reaction.hasPermission(["createProduct"], this.userId)) {
    selector["metadata.workflow"] = {
      $in: [null, "published"]
    };
  } else {
    selector["metadata.workflow"] = {
      $nin: ["archived"]
    };
  }

  if (RevisionApi.isRevisionControlEnabled()) {
    const handle = Media.find(selector).observeChanges({
      added: (id, fields) => {
        Logger.info("media: added");
        const revisions = Revisions.find({
          "documentId": id,
          "documentType": "images",
          "workflow.status": {
            $nin: [
              "revision/published"
            ]
          }
        }).fetch();
        fields.__revisions = revisions;
        this.added("Media", id, fields);
      },
      changed: (id, fields) => {
        Logger.info("media: changed");
        const revisions = Revisions.find({
          "documentId": id,
          "documentType": "image",
          "workflow.status": {
            $nin: [
              "revisions/published"
            ]
          }
        }).fetch();
        Logger.info("found revision for changed media", revisions);
        fields.__revisions = revisions;
        Logger.info("fields", fields);
        this.changed("Media", id, fields);
      },
      removed: (id) => {
        Logger.info("media: removed");
        this.removed("Media", id);
      }
    });

    const revisionHandle = Revisions.find({
      "documentType": "image",
      "workflow.status": {$nin: [ "revision/published"]}
    }).observe({
      added: (revision) => {
        const media = Media.findOne(revision.documentId);
        media.__revisions = [revision];
        this.added("Media", media._id, media);
        this.added("Revisions", revision._id, revision);
      },
      changed: (revision) => {
        Logger.info("revision: changed", revision);
        const media = Media.findOne(revision.documentId);
        media.__revisions = [revision];
        this.changed("Media", media._id, media);
        this.changed("revisions", revision._id, revision);
      },
      removed: (revision) => {
        if (revision) {
          Logger.info("revision: removed", revision);
          const media = Media.findOne(revision.documentId);
          media.__revisions = [];
          this.changed("Media", media._id, media);
          this.removed("Revisions", revision._id, revision);
        }
      }
    });

    this.onStop(() => {
      handle.stop();
      revisionHandle.stop();
    });
  }

  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});
