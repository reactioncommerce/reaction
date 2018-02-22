import { Meteor } from "meteor/meteor";
import { Revisions } from "/lib/collections";
import { Logger } from "/server/api";
import { RevisionApi } from "../lib/api";

export function createRevision(product) {
  if (RevisionApi.isRevisionControlEnabled() === false) {
    return true;
  }

  if (product.workflow && Array.isArray(product.workflow.workflow) && product.workflow.workflow.indexOf("imported") !== -1) {
    // Mark imported products as published by default.
    return true;
  }

  const productRevision = Revisions.findOne({
    "documentId": product._id,
    "workflow.status": {
      $nin: [
        "revision/published"
      ]
    }
  });

  // Prevent this product from being created if a parent product / varaint ancestor is deleted.
  //
  // This will prevent cases where a parent variant hase been deleted and a user tries to create a
  // child variant. You cannot create the child variant becuase the parent will no longer exist when
  // changes have been published; resulting in a broken inheretence and UI
  const productHasAncestors = Array.isArray(product.ancestors);

  if (productHasAncestors) {
    // Verify there are no deleted ancestors,
    // Variants cannot be restored if their parent product / variant is deleted
    const archivedCount = Revisions.find({
      "documentId": { $in: product.ancestors },
      "documentData.isDeleted": true,
      "workflow.status": {
        $nin: [
          "revision/published"
        ]
      }
    }).count();

    if (archivedCount > 0) {
      Logger.debug(`Cannot create product ${product._id} as a product/variant higher in it's ancestors tree is marked as 'isDeleted'.`);
      throw new Meteor.Error("unable-to-create-variant", "Unable to create product variant");
    }
  }


  if (!productRevision) {
    Logger.debug(`No revision found for product ${product._id}. Creating new revision`);

    Revisions.insert({
      documentId: product._id,
      documentData: product
    });
  }
}
