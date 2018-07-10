import { Meteor } from "meteor/meteor";
import findVariantInCatalogProduct from "./findVariantInCatalogProduct";

/**
 * @param {Object} collections - Map of raw MongoDB collections
 * @param {String} productId The Products collections ID for the product
 * @param {String} variantId The Products collections ID for the variant of this product
 * @returns {Object} { catalogProductItem, catalogProduct, variant }
 */
export default async function findProductAndVariant(collections, productId, variantId) {
  const { Catalog } = collections;

  const catalogProductItem = await Catalog.findOne({
    "product.productId": productId,
    "product.isVisible": true,
    "product.isDeleted": { $ne: true },
    "isDeleted": { $ne: true }
  });

  if (!catalogProductItem) {
    throw new Meteor.Error("not-found", `CatalogProduct with product ID ${productId} not found`);
  }

  const catalogProduct = catalogProductItem.product;

  const variant = findVariantInCatalogProduct(catalogProduct, variantId);
  if (!variant) {
    throw new Meteor.Error("invalid-param", `Product with ID ${productId} has no variant with ID ${variantId}`);
  }

  return { catalogProductItem, catalogProduct, variant };
}
