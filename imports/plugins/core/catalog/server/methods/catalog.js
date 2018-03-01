import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Products, Catalog as CatalogCollection } from "/lib/collections";
import { Logger } from "/server/api";
import { Media } from "/imports/plugins/core/files/server";
import { ProductRevision as Catalog } from "/imports/plugins/core/revisions/server/hooks";

/**
 * isSoldOut
 * @private
 * @summary We are stop accepting new orders if product marked as `isSoldOut`.
 * @param {Array} variants - Array with top-level variants
 * @return {Boolean} true if summary product quantity is zero.
 */
function isSoldOut(variants) {
  return variants.every((variant) => {
    if (variant.inventoryManagement) {
      return Catalog.getVariantQuantity(variant) <= 0;
    }
    return false;
  });
}

/**
 * isLowQuantity
 * @private
 * @summary If at least one of the variants is less than the threshold, then function returns `true`
 * @param {Array} variants - array of child variants
 * @return {boolean} low quantity or not
 */
function isLowQuantity(variants) {
  return variants.some((variant) => {
    const quantity = Catalog.getVariantQuantity(variant);
    // we need to keep an eye on `inventoryPolicy` too and qty > 0
    if (variant.inventoryManagement && variant.inventoryPolicy && quantity) {
      return quantity <= variant.lowInventoryWarningThreshold;
    }
    return false;
  });
}

/**
 * isBackorder
 * @private
 * @description Is products variants is still available to be ordered after summary variants quantity is zero
 * @param {Array} variants - array with variant objects
 * @return {boolean} is backorder allowed or not for a product
 */
function isBackorder(variants) {
  return variants.every((variant) => variant.inventoryPolicy && variant.inventoryManagement &&
    variant.inventoryQuantity === 0);
}


export async function publishProductToCatalog(productId) {
  check(productId, String);

  let product = Products.findOne({
    $or: [
      { _id: productId },
      { ancestors: { $in: [productId] } }
    ]
  });

  if (!product) {
    throw new Meteor.error("error", "Cannot publish product");
  }

  if (Array.isArray(product.ancestors) && product.ancestors.length) {
    product = Products.findOne({
      _id: product.ancestors[0]
    });
  }

  const variants = Products.find({
    ancestors: {
      $in: [productId]
    }
  }).fetch();

  const mediaArray = await Media.find({
    "metadata.productId": productId
  });

  const productMedia = mediaArray.map((media) => ({
    thumbnail: `${media.url({ store: "thumbnail" })}`,
    small: `${media.url({ store: "small" })}`,
    medium: `${media.url({ store: "medium" })}`,
    large: `${media.url({ store: "large" })}`
  }));

  console.log("mediaArray", productMedia);

  product.varaints = variants;
  product.isSoldOut = isSoldOut(variants);
  product.isBackorder = isBackorder(variants);
  product.isLowQuantity = isLowQuantity(variants);
  product.media = productMedia;

  return CatalogCollection.upsert({
    _id: productId
  }, {
    $set: product
  }, {
    multi: true,
    upsert: true,
    validate: false
  });
}

Meteor.methods({
  "catalog/publishProduct": publishProductToCatalog
});
