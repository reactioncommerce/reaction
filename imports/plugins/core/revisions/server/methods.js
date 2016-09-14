import { Products, Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

Meteor.methods({
  "revisions/publish"(documentIds) {
    check(documentIds, Match.OneOf(String, Array));

    // Also publish variants if they have a draft
    let revisions;

    if (Array.isArray(documentIds)) {
      revisions = Revisions.find({
        "workflow.status": {
          $nin: [
            "revision/published"
          ]
        },
        "$or": [
          {
            documentId: {
              $in: documentIds
            }
          },
          {
            "documentData.ancestors": {
              $in: documentIds
            }
          }
        ]
      }).fetch();
    } else {
      revisions = Revisions.find({
        "workflow.status": {
          $nin: [
            "revision/published"
          ]
        },
        "$or": [
          { documentId: documentIds },
          {
            "documentData.ancestors": {
              $in: [documentIds]
            }
          }
        ]
      }).fetch();
    }

    let updatedDocuments = 0;

    if (revisions) {
      for (let revision of revisions) {
        const res = Products.update({
          _id: revision.documentId
        }, {
          $set: revision.documentData
        }, {
          publish: true
        });

        updatedDocuments += res;
      }
    }

    if (updatedDocuments > 0) {
      return true;
    }

    throw new Meteor.Error(403, "Forbidden", "Could not publish product revision");
  }
});
