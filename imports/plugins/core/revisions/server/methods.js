import { Products, Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import isArray from "lodash/isarray";
import { check, Match } from "meteor/check";

Meteor.methods({
  "revisions/publish"(documentIds) {
    check(documentIds, Match.OneOf(String, Array));

    // Also publish variants if they have a draft
    let revisions;

    if (isArray(documentIds)) {
      revisions = Revisions.find({
        $or: [
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
        $or: [
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
