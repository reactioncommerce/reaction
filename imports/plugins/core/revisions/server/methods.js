import { Products, Revisions } from "/lib/collections";
import { Meteor } from "meteor/meteor";

Meteor.methods({
  "revisions/publish"(documentId) {
    check(documentId, String);

    // Also publish variants if they have a draft
    const revisions = Revisions.find({
      $or: [
        { documentId },
        {
          "documentData.ancestors": {
            $in: [documentId]
          }
        }
      ]
    }).fetch();

    if (revisions) {
      for (let revision of revisions) {
        Products.update({
          _id: revision.documentId
        }, {
          $set: revision.documentData
        }, {
          publish: true
        });
      }
    }
  }
});
