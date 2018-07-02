import Logger from "@reactioncommerce/logger";
import getCatalogProductMedia from "./getCatalogProductMedia";
import getPriceRange from "./getPriceRange";
import isBackorder from "./isBackorder";
import isLowQuantity from "./isLowQuantity";
import isSoldOut from "./isSoldOut";

/**
 * @method
 * @summary Converts a variant Product document into the catalog schema for variants
 * @param {Object} variant The variant from Products collection
 * @param {Object} variantPriceInfo The result of calling getPriceRange for this price or all child prices
 * @param {String} shopCurrencyCode The shop currency code for the shop to which this product belongs
 * @private
 */
function xformVariant(variant, variantPriceInfo, shopCurrencyCode) {
  return {
    _id: variant._id,
    barcode: variant.barcode,
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
    pricing: {
      [shopCurrencyCode]: {
        compareAtPrice: variant.compareAtPrice || null,
        displayPrice: variantPriceInfo.range,
        maxPrice: variantPriceInfo.max,
        minPrice: variantPriceInfo.min,
        price: typeof variant.price === "number" ? variant.price : null
      }
    },
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
  };
}

/**
 * @method createCatalogProduct
 * @summary Publish a product to the Catalog collection
 * @memberof Catalog
 * @param {Object} product - A product object
 * @param {Object} collections - Raw mongo collections
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function createCatalogProduct(product, collections) {
  const { Products, Shops } = collections;

  if (!product) {
    Logger.info("Cannot publish to catalog: undefined product");
    return false;
  }

  if (Array.isArray(product.ancestors) && product.ancestors.length) {
    Logger.info("Cannot publish to catalog: product is a variant");
    return false;
  }

  const shop = await Shops.findOne(
    { _id: product.shopId },
    {
      fields: {
        currencies: 1,
        currency: 1
      }
    }
  );
  if (!shop) {
    Logger.info(`Cannot publish to catalog: product's shop (ID ${product.shopId}) not found`);
    return false;
  }

  const shopCurrencyCode = shop.currency;
  const shopCurrencyInfo = shop.currencies[shopCurrencyCode];

  const catalogProductMedia = await getCatalogProductMedia(product._id, collections);
  const primaryImage = catalogProductMedia.find(({ toGrid }) => toGrid === 1) || null;

  // Get all variants of the product and denormalize them into an array on the CatalogProduct
  const variants = await Products.find({
    ancestors: product._id,
    isDeleted: { $ne: true },
    isVisible: { $ne: false }
  }).toArray();

  const topVariants = [];
  const options = new Map();

  variants.forEach((variant) => {
    if (variant.ancestors.length === 2) {
      const parentId = variant.ancestors[1];
      if (options.has(parentId)) {
        options.get(parentId).push(variant);
      } else {
        options.set(parentId, [variant]);
      }
    } else {
      topVariants.push(variant);
    }
  });

  const prices = [];
  const catalogProductVariants = topVariants
    // We want to explicitly map everything so that new properties added to variant are not published to a catalog unless we want them
    .map((variant) => {
      const variantOptions = options.get(variant._id);
      let priceInfo;
      if (variantOptions) {
        const optionPrices = variantOptions.map((option) => option.price);
        priceInfo = getPriceRange(optionPrices, shopCurrencyInfo);
      } else {
        priceInfo = getPriceRange([variant.price], shopCurrencyInfo);
      }

      prices.push(priceInfo.min, priceInfo.max);
      const newVariant = xformVariant(variant, priceInfo, shopCurrencyCode);

      if (variantOptions) {
        newVariant.options = variantOptions.map((option) =>
          xformVariant(option, getPriceRange([option.price], shopCurrencyInfo), shopCurrencyCode));
      }
      return newVariant;
    });

  const productPriceInfo = getPriceRange(prices, shopCurrencyInfo);
  const catalogProduct = {
    // We want to explicitly map everything so that new properties added to product are not published to a catalog unless we want them
    _id: product._id,
    barcode: product.barcode,
    createdAt: product.createdAt,
    description: product.description,
    height: product.height,
    isBackorder: isBackorder(variants),
    isDeleted: !!product.isDeleted,
    isLowQuantity: isLowQuantity(variants),
    isSoldOut: isSoldOut(variants),
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
    positions: product.positions,
    price: product.price,
    pricing: {
      [shop.currency]: {
        compareAtPrice: product.compareAtPrice || null,
        displayPrice: productPriceInfo.range,
        maxPrice: productPriceInfo.max,
        minPrice: productPriceInfo.min,
        price: null
      }
    },
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

  return catalogProduct;
}
