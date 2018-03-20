
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Products, Revisions, Tags } from "/lib/collections";
import { Hooks, Logger } from "/server/api";
import { RevisionApi } from "../lib/api";
import { ProductRevision } from "./hooks";
import { getSlug } from "/lib/api";


/**
 * @method insertRevision
 * @summary Inserts a new revision for a given product
 *
 * @param {Object} product
 * @returns {undefined}
 */
export function insertRevision(product) {
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

  // Prevent this product from being created if a parent product / variant ancestor is deleted.
  //
  // This will prevent cases where a parent variant has been deleted and a user tries to create a
  // child variant. You cannot create the child variant because the parent will no longer exist when
  // changes have been published; resulting in a broken inheritance and UI
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

/**
 * @method updateRevision
 * @summary Update a product's revision
 *
 * @param {String} userId
 * @param {Object} product - Product to update
 * @param {Object} options - Options include userId, modifier and validation properties
 * @returns {Boolean} true if underlying product should be updated, otherwise false.
 */
export function updateRevision(product, options = {}) {
  if (RevisionApi.isRevisionControlEnabled() === false) {
    return true;
  }

  const { userId, modifier } = options;

  let productRevision = Revisions.findOne({
    "documentId": product._id,
    "workflow.status": {
      $nin: ["revision/published"]
    }
  });

  // Prevent this product revision from being restored from isDeleted state if a product / variant
  // ancestor is also deleted.
  //
  // This will prevent cases where a parent variant has been deleted and a user tries to restore a
  // child variant. You cannot restore the child variant, because the parent will no longer exist when
  // changes have been published; resulting in a broken inheritance and UI
  const revisionHasAncestors =
    productRevision && productRevision.documentData && Array.isArray(productRevision.documentData.ancestors);
  const modifierContainsIsDeleted = modifier.$set && modifier.$set.isDeleted === false;

  if (revisionHasAncestors && modifierContainsIsDeleted) {
    // Verify there are no deleted ancestors,
    // Variants cannot be restored if their parent product / variant is deleted
    const archivedCount = Revisions.find({
      "documentId": { $in: productRevision.documentData.ancestors },
      "documentData.isDeleted": true,
      "workflow.status": {
        $nin: ["revision/published"]
      }
    }).count();

    if (archivedCount > 0) {
      Logger.debug(`Cannot restore product ${
        product._id
      } as a product/variant higher in it's ancestors tree is marked as 'isDeleted'.`);
      throw new Meteor.Error("unable-to-delete-variant", "Unable to delete product variant");
    }
  }


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
      $nin: ["revision/published"]
    }
  };

  // Create a new modifier for the revision
  const revisionModifier = {
    $set: {
      "workflow.status": "revision/update"
    }
  };

  let publish = false;
  if (Object.prototype.hasOwnProperty.call(options, "publish")) {
    ({ publish } = options);
  }

  if (publish === true || (product.workflow && product.workflow.status === "product/publish")) {
    // Maybe mark the revision as published

    Logger.debug(`Publishing revision for product ${product._id}.`);
    Revisions.update(revisionSelector, {
      $set: {
        "workflow.status": "revision/published"
      }
    });
    Hooks.Events.run("afterRevisionsUpdate", userId, {
      ...productRevision,
      workflow: { ...productRevision.workflow, status: "revisions/published" }
    });
    return true;
  }

  const hasAncestors = Array.isArray(product.ancestors) && product.ancestors.length > 0;

  for (const operation in modifier) {
    if (Object.hasOwnProperty.call(modifier, operation)) {
      if (!revisionModifier[operation]) {
        revisionModifier[operation] = {};
      }

      for (const property in modifier[operation]) {
        if ({}.hasOwnProperty.call(modifier[operation], property)) {
          if (operation === "$set" && property === "metafields.$") {
            // Special handling for meta fields with $ operator
            // We need to update the selector otherwise the operation would completely fail.
            //
            // This does NOT apply to metafield.0, metafield.1, metafield.n operations
            // where 0, 1, n represent an array index.

            // const originalSelector = options.selector;
            revisionSelector["documentData.metafields"] = options.metafields;
            revisionModifier.$set[`documentData.${property}`] = modifier.$set[property];
          } else if (operation === "$push" && property === "hashtags") {
            if (!revisionModifier.$addToSet) {
              revisionModifier.$addToSet = {};
            }
            revisionModifier.$addToSet[`documentData.${property}`] = modifier.$push[property];
          } else if (operation === "$set" && property === "price" && hasAncestors) {
            Revisions.update(revisionSelector, {
              $set: {
                "documentData.price": modifier.$set.price
              }
            });
            Hooks.Events.run("afterRevisionsUpdate", userId, {
              ...productRevision,
              documentData: { ...productRevision.documentData, price: modifier.$set.price }
            });

            const updateId = product.ancestors[0] || product._id;
            const priceRange = ProductRevision.getProductPriceRange(updateId);

            Meteor.call("products/updateProductField", updateId, "price", priceRange);
          } else if (operation === "$set" && property === "isVisible" && hasAncestors) {
            Revisions.update(revisionSelector, {
              $set: {
                "documentData.isVisible": modifier.$set.isVisible
              }
            });
            Hooks.Events.run("afterRevisionsUpdate", userId, {
              ...productRevision,
              documentData: { ...productRevision.documentData, isVisible: modifier.$set.isVisible }
            });

            const updateId = product.ancestors[0] || product._id;
            const priceRange = ProductRevision.getProductPriceRange(updateId);

            Meteor.call("products/updateProductField", updateId, "price", priceRange);
          } else if (
            operation === "$set" &&
            (property === "title" || property === "handle") &&
            hasAncestors === false
          ) {
            // Special handling for product title and handle
            //
            // Summary:
            // When a user updates the product title, if the handle matches the product id,
            // then update the handle to be a slugified version of the title
            //
            // This block ensures that the handle is either a custom slug, slug of the title, or
            // the _id of the product, but is never blank

            // New data
            const newValue = modifier.$set[property];
            const newTitle = modifier.$set.title;
            const newHandle = modifier.$set.handle;

            // Current revision data
            const { documentId } = productRevision;
            const slugDocId = getSlug(documentId);
            const revisionTitle = productRevision.documentData.title;
            const revisionHandle = productRevision.documentData.handle;

            // Checks
            const hasNewHandle = _.isEmpty(newHandle) === false;
            const hasExistingTitle = _.isEmpty(revisionTitle) === false;
            const hasNewTitle = _.isEmpty(newTitle) === false;
            const hasHandle = _.isEmpty(revisionHandle) === false;
            const handleMatchesId =
              revisionHandle === documentId ||
              revisionHandle === slugDocId ||
              newValue === documentId ||
              newValue === slugDocId;

            // Continue to set the title / handle as originally requested
            // Handle will get changed if conditions are met in the below if block
            revisionModifier.$set[`documentData.${property}`] = newValue;

            if (
              (handleMatchesId || hasHandle === false) &&
              (hasExistingTitle || hasNewTitle) &&
              hasNewHandle === false
            ) {
              // Set the handle to be the slug of the product.title
              // when documentId (product._id) matches the handle, then handle is empty, and a title exists
              revisionModifier.$set["documentData.handle"] = getSlug(newTitle || revisionTitle);
            } else if (hasHandle === false && hasExistingTitle === false && hasNewHandle === false) {
              // If the handle & title is empty, the handle becomes the product id
              revisionModifier.$set["documentData.handle"] = documentId;
            } else if (hasNewHandle === false && property === "handle") {
              // If the handle is empty, the handle becomes the slugified product title, or document id if title does not exist.
              // const newTitle = modifier.$set["title"];
              revisionModifier.$set["documentData.handle"] = hasExistingTitle
                ? getSlug(newTitle || revisionTitle)
                : documentId;
            }
          } else if (operation === "$unset" && property === "handle" && hasAncestors === false) {
            // Special handling for product handle when it is going to be unset
            //
            // Summary:
            // When a user updates the handle to a black string e.g. deletes all text in field in UI and saves,
            // the handle will be adjusted so it will not be blank
            const newValue = modifier.$unset[property];
            const revisionTitle = productRevision.documentData.title;
            const hasExistingTitle = _.isEmpty(revisionTitle) === false;

            // If the new handle is going to be empty, the handle becomes the slugified product title, or document id if title does not exist.
            if (_.isEmpty(newValue)) {
              revisionModifier.$set["documentData.handle"] = hasExistingTitle
                ? getSlug(revisionTitle)
                : productRevision.documentId;
            }
          } else {
            // Let everything else through
            revisionModifier[operation][`documentData.${property}`] = modifier[operation][property];
          }
        }
      }
    }
  }

  Revisions.update(revisionSelector, revisionModifier);
  const updatedRevision = Revisions.findOne({ documentId: product._id });
  Hooks.Events.run("afterRevisionsUpdate", userId, updatedRevision);

  Logger.debug(`Revision updated for product ${product._id}.`);

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
      Tags.update(
        {
          _id: tagId
        },
        {
          $set: {
            isDeleted: true
          }
        }
      );
    } else {
      Tags.update(
        {
          _id: tagId
        },
        {
          $set: {
            isDeleted: false
          }
        }
      );
    }
  }

  // If we are using $set or $inc, and the fields are one of the ignoredFields,
  // allow product to be updated without going through revision control
  if ((modifier.$set || modifier.$inc) && !modifier.$pull && !modifier.$push) {
    const newSet = {};
    const newInc = {};
    let hasIgnoredFields = false;
    const ignoredFields = ["isLowQuantity", "isSoldOut", "inventoryQuantity"];

    for (const field of ignoredFields) {
      if (modifier.$set && (
        typeof modifier.$set[field] === "number" ||
        typeof modifier.$set[field] === "boolean" ||
        typeof modifier.$set[field] === "string"
      )) {
        newSet[field] = modifier.$set[field];
        hasIgnoredFields = true;
      }

      if (modifier.$inc && (
        typeof modifier.$inc[field] === "number" ||
        typeof modifier.$inc[field] === "boolean" ||
        typeof modifier.$set[field] === "string"
      )) {
        newInc[field] = modifier.$inc[field];
        hasIgnoredFields = true;
      }
    }
    if (_.isEmpty(newSet) === false) {
      modifier.$set = newSet;
    }

    if (_.isEmpty(newInc) === false) {
      modifier.$inc = newInc;
    }

    return hasIgnoredFields === true;
  }

  // prevent the underlying document from being modified as it is in draft mode
  return false;
}
/**
 * @method markRevisionAsDeleted
 * @summary Flag a product's revision as deleted
 *
 * @param {Object} product - The product whose revision will be flagged as deleted.
 * @param {Object} options - Contains userId
 * @returns {undefined}
 */
export function markRevisionAsDeleted(product, options) {
  if (RevisionApi.isRevisionControlEnabled() === false) {
    return true;
  }

  const { userId } = options;

  let productRevision = Revisions.findOne({
    documentId: product._id
  });

  if (!productRevision) {
    Logger.debug(`No revision found for product ${product._id}. Creating new revision`);

    Revisions.insert({
      documentId: product._id,
      documentData: product
    });
    productRevision = Revisions.findOne({
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
  Hooks.Events.run("afterRevisionsUpdate", userId, {
    ...productRevision,
    documentData: { ...productRevision.documentData, isDeleted: true },
    workflow: { ...productRevision.workflow, workflow: "revision/remove" }
  });

  Logger.debug(`Revision updated for product ${product._id}.`);
  Logger.debug(`Product ${product._id} is now marked as deleted.`);

  // If the original product is deleted, and the user is trying to delete it again,
  // then actually remove it completely.
  //
  // This acts like a trash. Where the product is sent to trash before it can actually
  // be deleted permanently.
  if (product.isDeleted === true) {
    Logger.debug(`Allowing write to product ${product._id} for Collection.remove().`);

    return true;
  }

  Logger.debug(`Preventing write to product ${product._id} for Collection.remove().`);
  return false;
}
