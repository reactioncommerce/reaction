import { Products, Revisions, Tags } from "/lib/collections";
import { Logger } from "/server/api";
import { diff } from "deep-diff";
import { RevisionApi } from "../lib/api";

Products.before.insert((userId, product) => {
  if (RevisionApi.isRevisionControlEnabled() === false) {
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

  if (!productRevision) {
    Logger.debug(`No revision found for product ${product._id}. Creating new revision`);

    Revisions.insert({
      documentId: product._id,
      documentData: product
    });
  }
});


Products.before.update(function (userId, product, fieldNames, modifier, options) {
  if (RevisionApi.isRevisionControlEnabled() === false) {
    return true;
  }

  let productRevision = Revisions.findOne({
    "documentId": product._id,
    "workflow.status": {
      $nin: [
        "revision/published"
      ]
    }
  });

  const originalSelector = this.args[0];

  if (!productRevision) {
    Logger.debug(`No revision found for product ${product._id}. Creating new revision`);

    // Create a new revision
    Revisions.insert({
      documentId: product._id,
      documentData: product
    });

    // Fetch newly created revision
    productRevision = Revisions.findOne({
      documentId: product._id
    });
  }

  // Create a new selector for the revision
  //
  // This is especially important since we may need to update some fields
  // like metadata, and the selector is very important to that.
  const revisionSelector = {
    "documentId": product._id,
    "workflow.status": {
      $nin: [
        "revision/published"
      ]
    }
  };

  // Create a new modifier for the revision
  const revisionModifier = {
    $set: {
      "workflow.status": "revision/update"
    }
  };

  if (options.publish === true || (product.workflow && product.workflow.status === "product/publish")) {
    // Maybe mark the revision as published

    Logger.debug(`Publishing revison for product ${product._id}.`);
    Revisions.update(revisionSelector, {
      $set: {
        "workflow.status": "revision/published"
      }
    });

    return true;
  }

  for (const operation in modifier) {
    if (Object.hasOwnProperty.call(modifier, operation)) {
      if (!revisionModifier[operation]) {
        revisionModifier[operation] = {};
      }

      for (const property in modifier[operation]) {
        if (modifier[operation].hasOwnProperty(property)) {
          if (operation === "$set" && property === "metafields.$") {
            // Special handling for meta fields with $ operator
            // We need to update the selector otherwise the operation would completly fail.
            //
            // This does NOT apply to metafield.0, metafield.1, metafield.n operations
            // where 0, 1, n represent an array index.
            revisionSelector["documentData.metafields"] = originalSelector.metafields;
            revisionModifier.$set[`documentData.${property}`] = modifier.$set[property];
          } else if (operation === "$push" && property === "hashtags") {
            if (!revisionModifier.$addToSet) {
              revisionModifier.$addToSet = {};
            }
            revisionModifier.$addToSet[`documentData.${property}`] = modifier.$push[property];
          } else {
            // Let everything else through
            revisionModifier[operation][`documentData.${property}`] = modifier[operation][property];
          }
        }
      }
    }
  }

  Revisions.update(revisionSelector, revisionModifier);

  Logger.debug(`Revison updated for product ${product._id}.`);

  if (modifier.$pull && modifier.$pull.hashtags) {
    const tagId = modifier.$pull.hashtags;

    const productCount = Products.find({
      hashtags: {
        $in: [tagId]
      }
    }).count();

    const relatedTagsCount = Tags.find({
      relatedTagIds: {
        $in: [tagId]
      }
    }).count();

    if (productCount === 0 && relatedTagsCount === 0) {
      // Mark tag as deleted
      Tags.update({
        _id: tagId
      }, {
        $set: {
          isDeleted: true
        }
      });
    } else {
      Tags.update({
        _id: tagId
      }, {
        $set: {
          isDeleted: false
        }
      });
    }
  }

  // Allow the product collection to be updated if
  if ((modifier.$set || modifier.$inc) && !modifier.$pull && !modifier.$push) {
    const newSet = {};
    const newInc = {};
    const ignoredFields = [
      "isLowQuantity",
      "isSoldOut",
      "inventoryQuantity"
    ];

    for (const field of ignoredFields) {
      if (modifier.$set && modifier.$set[field]) {
        newSet[field] = modifier.$set[field];
      }

      if (modifier.$inc && modifier.$inc[field]) {
        newInc[field] = modifier.$inc[field];
      }
    }

    modifier.$set = newSet;
    modifier.$inc = newInc;
  }

  // prevent the underlying document from being modified as it is in draft mode
  return false;
});

Products.before.remove(function (userId, product) {
  if (RevisionApi.isRevisionControlEnabled() === false) {
    return true;
  }

  let productRevision = Revisions.findOne({
    documentId: product._id
  });

  if (!productRevision) {
    Logger.debug(`No revision found for product ${product._id}. Creating new revision`);

    Revisions.insert({
      documentId: product._id,
      documentData: product
    });
    productRevision =  Revisions.findOne({
      documentId: product._id
    });
  }

  // Set the revision as deleted "isDeleted: true"
  Revisions.update({
    documentId: product._id
  }, {
    $set: {
      "documentData.isDeleted": true,
      "workflow.status": "revision/remove"
    }
  });

  Logger.debug(`Revison updated for product ${product._id}.`);
  Logger.debug(`Product ${product._id} is now marked as deleted.`);

  // If the original product is deleted, and the user is trying to delete it again,
  // then actually remove it completly.
  //
  // This acts like a trash. Where the product is sent to trash before it can actually
  // be deleted perminately.
  if (product.isDeleted === true) {
    Logger.debug(`Allowing write to product ${product._id} for Collection.remove().`);

    return true;
  }

  Logger.debug(`Preventing write to product ${product._id} for Collection.remove().`);

  return false;
});

Revisions.after.update(function (userId, revision) {
  if (RevisionApi.isRevisionControlEnabled() === false) {
    return true;
  }

  // Make diff
  const product = Products.findOne({
    _id: revision.documentId
  });

  const differences = diff(product, revision.documentData);

  Revisions.direct.update({
    _id: revision._id
  }, {
    $set: {
      diff: differences && differences.map((d) => Object.assign({}, d))
    }
  });
}, {
  fetchPrevious: false
});
