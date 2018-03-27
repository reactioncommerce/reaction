import _ from "lodash";
import { diff } from "deep-diff";
import { RevisionApi } from "../lib/api";
import { insertRevision, updateRevision, markRevisionAsDeleted } from "./functions";
import { Products, Revisions } from "/lib/collections";
import { Hooks } from "/server/api";
import { Media } from "/imports/plugins/core/files/server";

export const ProductRevision = {
  getProductPriceRange(productId) {
    const product = Products.findOne(productId);
    if (!product) {
      return {
        range: "0",
        min: 0,
        max: 0
      };
    }

    const variants = this.getTopVariants(product._id);
    if (variants.length > 0) {
      const variantPrices = [];
      variants.forEach((variant) => {
        if (variant.isVisible === true) {
          const range = this.getVariantPriceRange(variant._id);
          if (typeof range === "string") {
            const firstPrice = parseFloat(range.substr(0, range.indexOf(" ")));
            const lastPrice = parseFloat(range.substr(range.lastIndexOf(" ") + 1));
            variantPrices.push(firstPrice, lastPrice);
          } else {
            variantPrices.push(range);
          }
        } else {
          variantPrices.push(0, 0);
        }
      });
      const priceMin = _.min(variantPrices);
      const priceMax = _.max(variantPrices);
      let priceRange = `${priceMin} - ${priceMax}`;
      // if we don't have a range
      if (priceMin === priceMax) {
        priceRange = priceMin.toString();
      }
      const priceObject = {
        range: priceRange,
        min: priceMin,
        max: priceMax
      };
      return priceObject;
    }

    if (!product.price) {
      return {
        range: "0",
        min: 0,
        max: 0
      };
    }

    // if we have no variants subscribed to (client)
    // we'll get the price object previously from the product
    return product.price;
  },

  getVariantPriceRange(variantId) {
    const children = this.getVariants(variantId);
    const visibleChildren = children.filter((child) => child.isVisible && !child.isDeleted);

    switch (visibleChildren.length) {
      case 0: {
        const topVariant = this.getProduct(variantId);
        // topVariant could be undefined when we removing last top variant
        return topVariant && topVariant.price;
      }
      case 1: {
        return visibleChildren[0].price;
      }
      default: {
        let priceMin = Number.POSITIVE_INFINITY;
        let priceMax = Number.NEGATIVE_INFINITY;

        visibleChildren.forEach((child) => {
          if (child.price < priceMin) {
            priceMin = child.price;
          }
          if (child.price > priceMax) {
            priceMax = child.price;
          }
        });

        if (priceMin === priceMax) {
          // TODO check impact on i18n/formatPrice from moving return to string
          return priceMin.toString();
        }
        return `${priceMin} - ${priceMax}`;
      }
    }
  },

  findRevision({ documentId }) {
    return Revisions.findOne({
      documentId,
      "workflow.status": {
        $nin: [
          "revision/published"
        ]
      }
    });
  },

  getProduct(variantId) {
    const product = Products.findOne(variantId);
    const revision = this.findRevision({
      documentId: variantId
    });

    return (revision && revision.documentData) || product;
  },

  getTopVariants(id) {
    const variants = [];

    Products.find({
      ancestors: [id],
      type: "variant",
      isDeleted: false
    }).forEach((product) => {
      const revision = this.findRevision({
        documentId: product._id
      });

      if (revision && revision.documentData.isVisible) {
        variants.push(revision.documentData);
      } else if (!revision && product.isVisible) {
        variants.push(product);
      }

      return variants;
    });

    return variants;
  },

  getVariants(id, type) {
    const variants = [];

    Products.find({
      ancestors: { $in: [id] },
      type: type || "variant",
      isDeleted: false
    }).forEach((product) => {
      const revision = this.findRevision({
        documentId: product._id
      });

      if (revision && revision.documentData.isVisible) {
        variants.push(revision.documentData);
      } else if (!revision && product.isVisible) {
        variants.push(product);
      }
    });

    return variants;
  },

  getVariantQuantity(variant) {
    const options = this.getVariants(variant._id);
    if (options && options.length) {
      return options.reduce((sum, option) =>
        sum + option.inventoryQuantity || 0, 0);
    }
    return variant.inventoryQuantity || 0;
  }
};

/**
 * @function
 * @name beforeInsertCatalogProductInsertRevision
 *
 * @summary Executes the provided function when beforeInsertCatalogProductInsertRevision
 * hook is ran. The hook is ran before a product is inserted, and it will insert a
 * corresponding revision for the provided product.
 * @param {Function} Callback to execute
 * @return {Object} product - the product in which the callback was called on.
 */
Hooks.Events.add("beforeInsertCatalogProductInsertRevision", (product) => {
  insertRevision(product);

  return product;
});

/**
 * @function
 * @name afterInsertCatalogProductInsertRevision
 *
 * @summary Executes the provided function when beforeInsertCatalogProductInsertRevision
 * hook is ran. The hook is ran after a product is inserted, and it will insert a
 * corresponding revision for the provided product.
 * @param {Function} Callback to execute
 * @return {Object} product - the product in which the callback was called on.
 */
Hooks.Events.add("afterInsertCatalogProductInsertRevision", (product) => {
  insertRevision(product);

  return product;
});

/**
 * @function
 * @name beforeUpdateCatalogProduct
 *
 * @summary Executes the provided function when beforeUpdateCatalogProduct
 * hook is ran. The hook is ran before a product is updated, and it will updated the
 * corresponding revisions for the provided product.
 * @param {Function} Callback to execute
 * @return {Boolean} true|false - Used to determine whether the underlying product should be updated.
 */
Hooks.Events.add("beforeUpdateCatalogProduct", (product, options) => updateRevision(product, options));

/**
 * @function
 * @name beforeRemoveCatalogProduct
 *
 * @summary Executes the provided function when beforeRemoveCatalogProduct
 * hook is ran. The hook is ran before a product or variant is archived, and it will updated the
 * corresponding revisions for the provided product or variant.
 * @param {Function} Callback to execute
 * @return {Boolean} true|false - Used to determine whether the underlying product should be updated.
 */
Hooks.Events.add("beforeRemoveCatalogProduct", (product, options) => markRevisionAsDeleted(product, options));

Hooks.Events.add("afterRevisionsUpdate", (userId, revision) => {
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

  Revisions.update({
    _id: revision._id
  }, {
    $set: {
      diff: differences && differences.map((d) => Object.assign({}, d))
    }
  });
}, {
  fetchPrevious: false
});
