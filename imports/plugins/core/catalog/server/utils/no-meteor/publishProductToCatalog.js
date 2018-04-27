import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";

import isBackorder from "./isBackorder";
import isLowQuantity from "./isLowQuantity";
import isSoldOut from "./isSoldOut";
import getCatalogPositions from "./getCatalogPositions";
import getCatalogProductMedia from "./getCatalogProductMedia";

/**
 * @method publishProductToCatalog
 * @summary Publish a product to the Catalog collection
 * @memberof Catalog
 * @param {Object} product - A product object
 * @param {Object} collections - Raw mongo collections are passed to ProductRevision
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function publishProductToCatalog(product, collections) {
  const { Catalog, Products } = collections;

  if (!product) {
    Logger.info("Cannot publish product to catalog");
    return false;
  }

  const catalogProductMedia = await getCatalogProductMedia(product._id, collections);
  const primaryImage = catalogProductMedia.find(({ toGrid }) => toGrid === 1) || null;

  // Get all variants of the product and denormalize them into an array on the CatalogProduct
  const variants = await Products.find({ ancestors: product._id }).toArray();

  const catalogProductVariants = variants
    // We filter out deleted or non-visible variants when publishing to catalog.
    // We don't do this for top-level products.
    .filter((variant) => !variant.isDeleted && variant.isVisible)

    // We want to explicitly map everything so that new properties added to variant are not published to a catalog unless we want them
    .map((variant) => ({
      _id: variant._id,
      ancestorIds: variant.ancestors || [],
      barcode: variant.barcode,
      compareAtPrice: variant.compareAtPrice,
      createdAt: variant.createdAt,
      height: variant.height,
      index: variant.index || 0,
      inventoryManagement: !!variant.inventoryManagement,
      inventoryPolicy: !!variant.inventoryPolicy,
      isLowQuantity: !!variant.isLowQuantity,
      isSoldOut: !!variant.isSoldOut,
      isTaxable: !!variant.taxable,
      length: variant.length,
      lowInventoryWarningThreshold: variant.lowInventoryWarningThreshold,
      metafields: variant.metafields,
      minOrderQuantity: variant.minOrderQuantity,
      optionTitle: variant.optionTitle,
      originCountry: variant.originCountry,
      price: variant.price,
      shopId: variant.shopId,
      sku: variant.sku,
      taxCode: variant.taxCode,
      taxDescription: variant.taxDescription,
      title: variant.title,
      updatedAt: variant.updatedAt || variant.createdAt,
      // The _id prop could change whereas this should always point back to the source variant in Products collection
      variantId: variant._id,
      weight: variant.weight,
      width: variant.width
    }));

  const catalogProduct = {
    // We want to explicitly map everything so that new properties added to product are not published to a catalog unless we want them
    _id: product._id,
    barcode: product.barcode,
    compareAtPrice: product.compareAtPrice,
    createdAt: product.createdAt,
    description: product.description,
    height: product.height,
    isBackorder: await isBackorder(catalogProductVariants, collections),
    isDeleted: !!product.isDeleted,
    isLowQuantity: await isLowQuantity(catalogProductVariants, collections),
    isSoldOut: await isSoldOut(catalogProductVariants, collections),
    isTaxable: !!product.taxable,
    isVisible: !!product.isVisible,
    length: product.length,
    lowInventoryWarningThreshold: product.lowInventoryWarningThreshold,
    media: catalogProductMedia,
    metafields: product.metafields,
    metaDescription: product.metaDescription,
    minOrderQuantity: product.minOrderQuantity,
    originCountry: product.originCountry,
    pageTitle: product.pageTitle,
    parcel: product.parcel,
    price: product.price,
    primaryImage,
    // The _id prop could change whereas this should always point back to the source product in Products collection
    productId: product._id,
    productType: product.productType,
    requiresShipping: !!product.requiresShipping,
    shopId: product.shopId,
    sku: product.sku,
    slug: product.handle,
    socialMetadata: [
      { service: "twitter", message: product.twitterMsg },
      { service: "facebook", message: product.facebookMsg },
      { service: "googleplus", message: product.googleplusMsg },
      { service: "pinterest", message: product.pinterestMsg }
    ],
    tagIds: product.hashtags,
    taxCode: product.taxCode,
    taxDescription: product.taxDescription,
    title: product.title,
    type: "product-simple",
    updatedAt: product.updatedAt || product.createdAt,
    variants: catalogProductVariants,
    vendor: product.vendor,
    weight: product.weight,
    width: product.width
  };

  // Move `positions` onto the CatalogItem instead of the product, and switch from map to array
  const positions = await getCatalogPositions(product.positions);

  // Insert/update catalog document
  const result = await Catalog.updateOne(
    {
      "product.productId": product.productId
    },
    {
      $set: {
        positions,
        product: catalogProduct,
        shopId: product.shopId,
        updatedAt: new Date()
      },
      $setOnInsert: {
        _id: Random.id(),
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  return result && result.result && result.result.ok === 1;
}
