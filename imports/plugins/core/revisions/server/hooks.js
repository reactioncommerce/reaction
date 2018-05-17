// import _ from "lodash";
import { diff } from "deep-diff";
import { RevisionApi } from "../lib/api";
import { insertRevision, updateRevision, markRevisionAsDeleted } from "./functions";
import { Products, Revisions } from "/lib/collections";
import { Hooks } from "/server/api";
import { Media } from "/imports/plugins/core/files/server";

/**
 * @summary Executes the provided function when beforeInsertCatalogProductInsertRevision
 * hook is ran. The hook is ran before a product is inserted, and it will insert a
 * corresponding revision for the provided product.
 * @param {Function} Callback to execute
 * @return {Object} product - the product in which the callback was called on.
 * @private
 */
Hooks.Events.add("beforeInsertCatalogProductInsertRevision", (product) => {
  insertRevision(product);

  return product;
});

/**
 * @summary Executes the provided function when beforeInsertCatalogProductInsertRevision
 * hook is ran. The hook is ran after a product is inserted, and it will insert a
 * corresponding revision for the provided product.
 * @param {Function} Callback to execute
 * @return {Object} product - the product in which the callback was called on.
 * @private
 */
Hooks.Events.add("afterInsertCatalogProductInsertRevision", (product) => {
  insertRevision(product);

  return product;
});

/**
 * @summary Executes the provided function when beforeUpdateCatalogProduct
 * hook is ran. The hook is ran before a product is updated, and it will updated the
 * corresponding revisions for the provided product.
 * @param {Function} Callback to execute
 * @return {Boolean} true|false - Used to determine whether the underlying product should be updated.
 * @private
 */
Hooks.Events.add("beforeUpdateCatalogProduct", (product, options) => updateRevision(product, options));

/**
 * @summary Executes the provided function when beforeRemoveCatalogProduct
 * hook is ran. The hook is ran before a product or variant is archived, and it will updated the
 * corresponding revisions for the provided product or variant.
 * @param {Function} Callback to execute
 * @return {Boolean} true|false - Used to determine whether the underlying product should be updated.
 * @private
 */
Hooks.Events.add("beforeRemoveCatalogProduct", (product, options) => markRevisionAsDeleted(product, options));

Hooks.Events.add(
  "afterRevisionsUpdate",
  (userId, revision) => {
    if (RevisionApi.isRevisionControlEnabled() === false) {
      return true;
    }
    let differences;

    if (!revision.documentType || revision.documentType === "product") {
      // Make diff
      const product = Products.findOne({
        _id: revision.documentId
      });
      differences = diff(product, revision.documentData);
    }

    if (revision.documentType && revision.documentType === "image") {
      const image = Promise.await(Media.findOne(revision.documentId, { raw: true }));
      differences = image && diff(image.metadata, revision.documentData);
    }

    Revisions.update(
      {
        _id: revision._id
      },
      {
        $set: {
          diff: differences && differences.map((d) => Object.assign({}, d))
        }
      }
    );
  },
  {
    fetchPrevious: false
  }
);
