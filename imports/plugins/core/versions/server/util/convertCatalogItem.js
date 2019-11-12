import Logger from "@reactioncommerce/logger";
import getPriceRange from "./getPriceRange";

/**
 * @method
 * @summary Converts a variant Product document into the catalog schema for variants
 * @param {Object} variant The variant from Products collection
 * @param {Object} variantPriceInfo The result of calling getPriceRange for this price or all child prices
 * @param {String} shopCurrencyCode The shop currency code for the shop to which this product belongs
 * @param {Date} updatedAt The date to use for updatedAt
 * @private
 * @returns {Object} The transformed variant/option document
 */
function xformVariant(variant, variantPriceInfo, shopCurrencyCode, updatedAt) {
  return {
    _id: variant._id,
    barcode: variant.barcode,
    createdAt: variant.createdAt || updatedAt,
    height: variant.height,
    index: variant.index || 0,
    inventoryManagement: !!variant.inventoryManagement,
    inventoryPolicy: !!variant.inventoryPolicy,
    isLowQuantity: !!variant.isLowQuantity,
    isSoldOut: !!variant.isSoldOut,
    length: variant.length,
    lowInventoryWarningThreshold: variant.lowInventoryWarningThreshold,
    metafields: variant.metafields,
    attributes: variant.attributes,
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
    updatedAt: variant.updatedAt || variant.createdAt || updatedAt,
    // The _id prop could change whereas this should always point back to the source variant in Products collection
    variantId: variant._id,
    weight: variant.weight,
    width: variant.width
  };
}

/**
 * @param {Object} item The catalog item to transform
 * @param {Object} shop The shop document
 * @returns {Object} The converted item document
 */
export default function convertCatalogItem(item, shop) {
  if (!shop) {
    Logger.info("Cannot update catalog item: shop not found");
    return false;
  }

  const shopCurrencyCode = shop.currency;
  const shopCurrencyInfo = shop.currencies[shopCurrencyCode];

  const catalogProductMedia = item.media
    .map((media) => {
      const { metadata } = media;
      const { toGrid, priority, productId: prodId, variantId } = metadata || {};

      return {
        priority,
        toGrid,
        productId: prodId,
        variantId,
        URLs: {
          large: media.large,
          medium: media.medium,
          original: media.image,
          small: media.small,
          thumbnail: media.thumbnail
        }
      };
    })
    .sort((itemA, itemB) => itemA.priority - itemB.priority);

  const primaryImage = catalogProductMedia.find(({ toGrid }) => toGrid === 1) || null;

  // Get all variants of the product and denormalize them into an array on the CatalogProduct
  const variants = item.variants.filter((variant) => variant.isDeleted !== true && variant.isVisible === true);

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

  const updatedAt = new Date();

  const prices = [];
  const catalogProductVariants = topVariants.map((variant) => {
    const variantOptions = options.get(variant._id);
    let priceInfo;
    if (variantOptions) {
      const optionPrices = variantOptions.map((option) => option.price);
      priceInfo = getPriceRange(optionPrices, shopCurrencyInfo);
    } else {
      priceInfo = getPriceRange([variant.price], shopCurrencyInfo);
    }

    prices.push(priceInfo.min, priceInfo.max);
    const newVariant = xformVariant(variant, priceInfo, shopCurrencyCode, updatedAt);

    if (variantOptions) {
      newVariant.options = variantOptions.map((option) =>
        xformVariant(option, getPriceRange([option.price], shopCurrencyInfo), shopCurrencyCode, updatedAt));
    }
    return newVariant;
  });

  const productPriceInfo = getPriceRange(prices, shopCurrencyInfo);

  const catalogProduct = {
    _id: item._id,
    barcode: item.barcode,
    createdAt: item.createdAt || updatedAt,
    description: item.description,
    height: item.height,
    isBackorder: !!item.isBackorder,
    isDeleted: !!item.isDeleted,
    isLowQuantity: !!item.isLowQuantity,
    isSoldOut: !!item.isSoldOut,
    isVisible: item.isVisible,
    length: item.length,
    lowInventoryWarningThreshold: item.lowInventoryWarningThreshold,
    media: catalogProductMedia,
    metafields: item.metafields,
    attributes: item.attributes,
    metaDescription: item.metaDescription,
    minOrderQuantity: item.minOrderQuantity,
    originCountry: item.originCountry,
    pageTitle: item.pageTitle,
    parcel: item.parcel,
    price: item.price,
    pricing: {
      [shop.currency]: {
        compareAtPrice: item.compareAtPrice || null,
        displayPrice: productPriceInfo.range,
        maxPrice: productPriceInfo.max,
        minPrice: productPriceInfo.min,
        price: null
      }
    },
    primaryImage,
    productId: item._id,
    productType: item.productType,
    shopId: item.shopId,
    sku: item.sku,
    slug: item.handle,
    socialMetadata: [
      { service: "twitter", message: item.twitterMsg },
      { service: "facebook", message: item.facebookMsg },
      { service: "googleplus", message: item.googleplusMsg },
      { service: "pinterest", message: item.pinterestMsg }
    ],
    supportedFulfillmentTypes: item.supportedFulfillmentTypes,
    tagIds: item.hashtags,
    title: item.title,
    type: "product-simple",
    updatedAt: item.updatedAt || item.createdAt || updatedAt,
    variants: catalogProductVariants,
    vendor: item.vendor,
    weight: item.weight,
    width: item.width
  };

  const doc = {
    _id: item._id,
    product: catalogProduct,
    shopId: catalogProduct.shopId,
    updatedAt,
    createdAt: item.createdAt
  };

  return doc;
}
