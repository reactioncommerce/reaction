import Logger from "@reactioncommerce/logger";
import _ from "lodash";
import isBackorder from "./isBackorder";
import isLowQuantity from "./isLowQuantity";
import isSoldOut from "./isSoldOut";

/**
 *
 * @method updateCatalogProductInventoryStatus
 * @summary Update inventory status for a single Catalog Product.
 * @memberof Catalog
 * @param {string} productId - A string product id
 * @param {Object} collections - Raw mongo collections
 * @return {Promise<boolean>} true on success, false on failure
 */
export default async function updateCatalogProductInventoryStatus(productId, collections) {
  const baseKey = "product";
  const topVariants = new Map();
  const options = new Map();

  const { Catalog, Products } = collections;
  const catalogItem = await Catalog.findOne({ "product.productId": productId });

  if (!catalogItem) {
    Logger.info("Cannot publish inventory status changes to catalog product");
    return false;
  }

  const variants = await Products.find({ ancestors: productId }).toArray();

  const modifier = {
    "product.isSoldOut": isSoldOut(variants),
    "product.isBackorder": isBackorder(variants),
    "product.isLowQuantity": isLowQuantity(variants)
  };

  variants.forEach((variant) => {
    if (variant.ancestors.length === 2) {
      const parentId = variant.ancestors[1];
      if (options.has(parentId)) {
        options.get(parentId).push(variant);
      } else {
        options.set(parentId, [variant]);
      }
    } else {
      topVariants.set(variant._id, variant);
    }
  });

  const topVariantsFromCatalogItem = catalogItem.product.variants;

  topVariantsFromCatalogItem.forEach((variant, topVariantIndex) => {
    const catalogVariantOptions = variant.options || [];
    const topVariantFromProductsCollection = topVariants.get(variant._id);
    const variantOptionsFromProductsCollection = options.get(variant._id);
    const catalogVariantOptionsMap = new Map();

    catalogVariantOptions.forEach((catalogVariantOption) => {
      catalogVariantOptionsMap.set(catalogVariantOption._id, catalogVariantOption);
    });

    // We only want the variant options that are currently published to the catalog.
    // We need to be careful, not to publish variant or options to the catalog
    // that an operator may not wish to be published yet.
    const variantOptions = _.intersectionWith(
      variantOptionsFromProductsCollection, // array to filter
      catalogVariantOptions, // Items to exclude
      ({ _id: productVariantId }, { _id: catalogItemVariantOptionId }) => (
        // Exclude options from the products collection that aren't in the catalog collection
        productVariantId === catalogItemVariantOptionId
      )
    );

    if (variantOptions) {
      const variantInventoryAvailableToSell = variantOptions.reduce((sum, option) => sum + option.inventoryAvailableToSell || 0, 0); // TODO: EK - Get this number to correctly display on the variant
      const variantInventoryInStock = variantOptions.reduce((sum, option) => sum + option.inventoryQuantity || 0, 0); // TODO: EK - Get this number to correctly display on the variant

      // Create a modifier for a variant and it's options
      modifier[`${baseKey}.variants.${topVariantIndex}.isSoldOut`] = isSoldOut(variantOptions);
      modifier[`${baseKey}.variants.${topVariantIndex}.isLowQuantity`] = isLowQuantity(variantOptions);
      modifier[`${baseKey}.variants.${topVariantIndex}.isBackorder`] = isBackorder(variantOptions);
      modifier[`${baseKey}.variants.${topVariantIndex}.inventoryAvailableToSell`] = variantInventoryAvailableToSell;
      modifier[`${baseKey}.variants.${topVariantIndex}.inventoryInStock`] = variantInventoryInStock;

      variantOptions.forEach((option, optionIndex) => {
        modifier[`${baseKey}.variants.${topVariantIndex}.options.${optionIndex}.isSoldOut`] = isSoldOut([option]);
        modifier[`${baseKey}.variants.${topVariantIndex}.options.${optionIndex}.isLowQuantity`] = isLowQuantity([option]);
        modifier[`${baseKey}.variants.${topVariantIndex}.options.${optionIndex}.isBackorder`] = isBackorder([option]);
        modifier[`${baseKey}.variants.${topVariantIndex}.options.${optionIndex}.inventoryAvailableToSell`] = option.inventoryAvailableToSell;
        modifier[`${baseKey}.variants.${topVariantIndex}.options.${optionIndex}.inventoryInStock`] = option.inventoryQuantity;
      });
    } else {
      // Create a modifier for a top level variant only
      modifier[`${baseKey}.variants.${topVariantIndex}.isSoldOut`] = isSoldOut([topVariantFromProductsCollection]);
      modifier[`${baseKey}.variants.${topVariantIndex}.isLowQuantity`] = isLowQuantity([topVariantFromProductsCollection]);
      modifier[`${baseKey}.variants.${topVariantIndex}.isBackorder`] = isBackorder([topVariantFromProductsCollection]);
      modifier[`${baseKey}.variants.${topVariantIndex}.inventoryAvailableToSell`] = topVariantFromProductsCollection.inventoryAvailableToSell;
      modifier[`${baseKey}.variants.${topVariantIndex}.inventoryInStock`] = topVariantFromProductsCollection.inventoryQuantity;
    }
  });

  const result = await Catalog.updateOne(
    { "product.productId": productId },
    { $set: modifier }
  );

  return (result && result.result && result.result.ok === 1) || false;
}
