import { Products, Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";

Meteor.methods({
  "revisions/publish"(documentId) {
    check(documentId, String);

    const revision = Revisions.findOne({
      documentId
    });

    if (revision) {
      Products.update({
        _id: revision.documentId
      }, {
        $set: revision.documentData
      }, {
        publish: true
      });
    }

    // Also publish variants if they have a draft
    const otherRevisions = Revisions.find({
      "documentData.ancestors": {
        $in: [documentId]
      }
    }).fetch();

    if (otherRevisions) {
      for (let variantRevision of otherRevisions) {
        Products.update({
          _id: variantRevision.documentId
        }, {
          $set: variantRevision.documentData
        }, {
          publish: true
        });
      }
    }
  }
});
