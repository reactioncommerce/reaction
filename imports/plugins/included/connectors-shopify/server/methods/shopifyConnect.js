/* eslint camelcase: 0 */
// import fs from "fs";
// import https from "https";
import Shopify from "shopify-api-node";

import { Meteor } from "meteor/meteor";
// import { Random } from "meteor/random";
import { Logger } from "/server/api";
// import { check, Match } from "meteor/check";


// import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/server/api";
import { Packages, Products, Tags, Media } from "/lib/collections";


/**
 * Transforms a Shopify product into a Reaction product.
 * @method createReactionProductFromShopifyProduct
 * @param  {object} options { shopifyProduct, shopId, hashtags }
 * @return {[type]} An object that fits the `Product` schema
 */
function createReactionProductFromShopifyProduct(options) {
  const { shopifyProduct, shopId, hashtags } = options;
  const reactionProduct = {
    ancestors: [],
    createdAt: new Date(),
    description: shopifyProduct.body_html.replace(/(<([^>]+)>)/ig, ""), // Strip HTML
    handle: shopifyProduct.handle,
    hashtags: hashtags,
    isDeleted: false,
    isVisible: false,
    metafields: [{
      scope: "shopify",
      key: "shopifyId",
      value: shopifyProduct.id.toString(),
      namespace: "shopifyProperties"
    }],
    pageTitle: shopifyProduct.pageTitle,
    productType: shopifyProduct.product_type,
    requiresShipping: true,
    shopId: shopId, // set shopId to active shopId;
    template: "productDetailSimple",
    title: shopifyProduct.title,
    type: "simple",
    updatedAt: new Date(),
    vendor: shopifyProduct.vendor,
    workflow: {
      status: "synced",
      workflow: ["imported from Shopify"]
    }
  };

  // Add shopify options to meta fields as is.
  if (Array.isArray(shopifyProduct.options)) {
    shopifyProduct.options.forEach((option) => {
      reactionProduct.metafields.push({
        scope: "shopify",
        key: option.name,
        value: option.values.join(", "),
        namespace: "options"
      });
    });
  }

  return reactionProduct;
}

/**
 * Transforms a Shopify variant into a Reaction variant.
 * @method createReactionVariantFromShopifyVariant
 * @param  {object} options { shopifyVariant, variant, index, ancestors, shopId }
 * @return {[type]} An object that fits the `ProductVariant` schema
 */
function createReactionVariantFromShopifyVariant(options) {
  const { shopifyVariant, variant, index, ancestors, shopId } = options;
  const reactionVariant = {
    ancestors: ancestors,
    barcode: shopifyVariant.barcode,
    compareAtPrice: shopifyVariant.compare_at_price,
    createdAt: new Date(),
    height: 0,
    index: index,
    inventoryManagement: true,
    inventoryPolicy: shopifyVariant.inventory_policy === "deny",
    inventoryQuantity: shopifyVariant.inventory_quantity,
    isDeleted: false,
    isVisible: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
    metafields: [{
      scope: "shopify",
      key: "shopifyId",
      value: shopifyVariant.id.toString(),
      namespace: "shopifyProperties"
    }, {
      scope: "shopify",
      key: "shopifyProductId",
      value: shopifyVariant.product_id.toString(),
      namespace: "shopifyProperties"
    }],
    optionTitle: variant,
    price: parseFloat(shopifyVariant.price),
    requiresShipping: shopifyVariant.requires_shipping,
    shopId: shopId,
    sku: shopifyVariant.sku,
    taxable: true,
    taxCode: "0000",
    title: variant,
    type: "variant",
    updatedAt: new Date(),
    weight: normalizeWeight(shopifyVariant.grams),
    weightInGrams: shopifyVariant.grams,
    width: 0,
    workflow: {
      status: "synced",
      workflow: ["imported from Shopify"]
    }
  };

  if (shopifyVariant.inventory_management === null) {
    reactionVariant.inventoryQuantity = 0;
    reactionVariant.inventoryManagement = false;
  }

  return reactionVariant;
}

/**
 * Finds the images associated with a particular shopify variant
 * @method findVariantImages
 * @param  {Number} shopifyVariantId The variant `id` from shopify
 * @param  {Array} images An array of images from a Shopify product
 * @return {Array} Returns an array of images that match the passed shopifyVariantId
 */
function findVariantImages(shopifyVariantId, images) {
  return images.filter((imageObj) => {
    return imageObj.variant_ids.indexOf(shopifyVariantId) !== -1;
  });
}

/**
 * get Shopify Api Key, Password and Domain from the Shopify Connect package with the supplied shopId or alternatly the active shopId
 * @method getApiInfo
 * @param  {string} [shopId=Reaction.getShopId()] The shopId to get the API info for. Defaults to current shop.
 * @return {object} shopify API connection information
 */
function getApiInfo(shopId = Reaction.getShopId()) {
  const { settings } = Packages.findOne({
    name: "reaction-connectors-shopify",
    shopId
  });

  return {
    apiKey: settings.apiKey,
    password: settings.password,
    shopName: settings.shopName
  };
}


/**
 * Finds and returns arrays of option values for each of Shopify's option layers
 * returns an object consisting of the following three values:
 * shopifyVariants representing the first option on the shopify product (`option1` in the variant)
 * shopifyOptions representing the second option on the shopify product (`option2` in the variant)
 * shopifyTernary representing the third option on the shopify product (`option3` in the variant)
 * any of these will return undefined if the product does not have an option at that layer.
 * @method getShopifyVariantsAndOptions
 * @param  {object} shopifyProduct The shopify product we are importing
 * @return {object} returns an object consisting of shopifyVariants, shopifyOptions, and shopifyTernaryOptions
 */
function getShopifyVariantsAndOptions(shopifyProduct) {
  let shopifyVariants;
  let shopifyOptions;
  let shopifyTernaryOptions;
  // Get variant and option details
  if (shopifyProduct.options && Array.isArray(shopifyProduct.options)) {
    // This product has variants
    if (shopifyProduct.options.length > 0) {
      shopifyVariants = [...shopifyProduct.options[0].values];
    }

    // This product has options
    if (shopifyProduct.options.length > 1) {
      shopifyOptions = [...shopifyProduct.options[1].values];
    }

    if (shopifyProduct.options.length > 2) {
      shopifyTernaryOptions = [...shopifyProduct.options[2].values];
    }
  }
  return { shopifyVariants, shopifyOptions, shopifyTernaryOptions };
}


/**
 * Transforms a weight in grams to a weight in the shop's default unitsOfMeasure
 * @method normalizeWeight
 * @param  {number} weight weight of the product in grams
 * @return {number} weight of the product in the shop's default unitsOfMeasure
 */
function normalizeWeight(weight) {
  // TODO: get store unitsOfMeasure
  // convert weight in grams to store unitsOfMeasure
  return weight;
}

/**
 * Saves an image from a url to the Collection FS image storage location (default: Mongo GridFS)
 * @method saveImage
 * @param  {string}  url url of the image to save
 * @param  {object}  metadata metadata to save with the image
 * @return {void}
 */
function saveImage(url, metadata) {
  const fileObj = new FS.File();
  fileObj.attachData(url);
  fileObj.metadata = metadata;
  Media.insert(fileObj);
}

export const methods = {
  async "shopifyConnect/getProductsCount"() {
    const apiCreds = getApiInfo();
    const shopify = new Shopify(apiCreds);

    try {
      const count = await shopify.product.count();
      return count;
    } catch (err) {
      Logger.error("something went wrong");
    }
  },
  async "shopifyConnect/importProducts"() {
    const apiCreds = getApiInfo();
    const shopify = new Shopify(apiCreds);
    const shopId = Reaction.getShopId();
    const limit = 20;
    const opts = {
      published_status: "published",
      limit: limit
    };

    // Cache all tags as we discover or create them so we only ever have to look up a tag once
    // We should never have to look up a tag we've created during this import
    //
    // Start by caching all existing tags to memory in a {slug => id} tuple
    // This may need to be optimized if there are an enormous number of tags existing
    const tagCache = Tags.find({}).fetch().reduce((cache, tag) => {
      if (!cache[tag.slug]) {
        cache[tag.slug] = tag._id;
      }
      return cache;
    }, {});

    const ids = [];

    try {
      const productCount = await shopify.product.count();
      const numPages = 1; // Math.ceil(productCount / limit);
      const pages = [...Array(numPages).keys()];
      Logger.info(`Preparing to import ${productCount} products`);
      for (const page of pages) {
        Logger.info(`Importing page ${page} of ${numPages}`);
        const shopifyProducts = await shopify.product.list(opts);

        shopifyProducts.forEach((shopifyProduct) => {
          Logger.info(`Importing ${shopifyProduct.title}`);
          const price = { min: null, max: null, range: "0.00" };
          const hashtags = [];

          // Get and lookup or register tags
          // We can't load all tags beforehand because Shopify doesn't have a tags API
          shopifyProduct.tags.split(",").forEach((tag) => {
            const normalizedTag = {
              name: tag,
              slug: Reaction.getSlug(tag),
              shopId: shopId,
              isTopLevel: false,
              updatedAt: new Date(),
              createdAt: new Date()
            };

            // If we have a cached tag for this slug, we don't need to create a new one
            if (!tagCache[normalizedTag.slug]) {
              // this tag doesn't exist, create it, add it to our tag cache
              normalizedTag._id = Tags.insert(normalizedTag);
              tagCache[normalizedTag.slug] = normalizedTag._id;
            }
            // push the tag's _id into hashtags from the cache
            hashtags.push(tagCache[normalizedTag.slug]);
          });

          const { shopifyVariants, shopifyOptions, shopifyTernaryOptions } = getShopifyVariantsAndOptions(shopifyProduct);

          // Setup reaction product
          const reactionProduct = createReactionProductFromShopifyProduct({ shopifyProduct, shopId, hashtags });

          // Insert product, save id
          const reactionProductId = Products.insert(reactionProduct, { selector: { type: "simple" } });
          Logger.info(`Importing ${shopifyProduct.title}`);
          ids.push(reactionProductId);

          Logger.info("importing product image");
          saveImage(shopifyProduct.image.src, {
            ownerId: Meteor.userId(),
            productId: reactionProductId,
            variantId: reactionProductId,
            shopId: shopId,
            priority: 0,
            toGrid: 1
          });

          // If variantLabel exists, we have at least one variant
          if (shopifyVariants) {
            Logger.info(`Importing ${shopifyProduct.title} variants`);

            shopifyVariants.forEach((variant, i) => {
              const shopifyVariant = shopifyProduct.variants.find((v) => v.option1 === variant);

              if (shopifyVariant) {
                // create the Reaction variant
                const reactionVariant = createReactionVariantFromShopifyVariant({
                  shopifyVariant,
                  variant,
                  index: i,
                  ancestors: [reactionProductId],
                  shopId
                });

                // insert the Reaction variant
                const reactionVariantId = Products.insert(reactionVariant, { type: "variant" });
                ids.push(reactionVariantId);

                // If we have shopify options, create reaction options
                if (shopifyOptions) {
                  Logger.info(`Importing ${shopifyProduct.title} ${variant} options`);
                  shopifyOptions.forEach((option, j) => {
                    // Find the option that nests under our current variant.
                    const shopifyOption = shopifyProduct.variants.find((o) => {
                      return o.option1 === variant && o.option2 === option;
                    });

                    if (shopifyOption) {
                      const reactionOption = createReactionVariantFromShopifyVariant({
                        shopifyVariant: shopifyOption,
                        variant: option,
                        index: j,
                        ancestors: [reactionProductId, reactionVariantId],
                        shopId
                      });

                      const reactionOptionId = Products.insert(reactionOption, { type: "variant" });
                      ids.push(reactionOptionId);
                      Logger.info(`Imported ${shopifyProduct.title} ${variant}/${option}`);

                      // Update Max Price
                      if (price.max === null || price.max < reactionOption.price) {
                        price.max = reactionOption.price;
                      }

                      // Update Min Price
                      if (price.min === null || price.min > reactionOption.price) {
                        price.min = reactionOption.price;
                      }

                      // Save all relevant variant images to our option
                      const optionImages = findVariantImages(shopifyOption.id, shopifyProduct.images);
                      optionImages.forEach((imageObj) => {
                        saveImage(imageObj.src, {
                          ownerId: Meteor.userId(),
                          productId: reactionProductId,
                          variantId: reactionOptionId,
                          shopId: shopId,
                          priority: 1,
                          toGrid: 0
                        });
                      });

                      // THIS LOOP INSERTS PRODUCTS A LEVEL DEEPER THAN THE REACTION
                      // UI CURRENTLY SUPPORTS. IF YOUR SHOPIFY STORE USES THREE OPTION
                      // LEVELS, YOU WILL NEED TO BUILD UI SUPPORT FOR THAT.
                      if (shopifyTernaryOptions) {
                        Logger.warn("Importing shopify product with 3 options. The Reaction UI does not currently support this.");
                        Logger.info(`Importing ${shopifyProduct.title} ${variant} ${option} options`);
                        shopifyTernaryOptions.forEach((ternaryOption, k) => {
                          // Find the option that nests under our current variant.
                          const shopifyTernaryOption = shopifyProduct.variants.find((o) => {
                            return o.option1 === variant && o.option2 === option && o.option3 === ternaryOption;
                          });

                          if (shopifyTernaryOption) {
                            const reactionTernaryOption = createReactionVariantFromShopifyVariant({
                              shopifyVariant: shopifyTernaryOption,
                              variant: ternaryOption,
                              index: k,
                              ancestors: [reactionProductId, reactionVariantId, reactionOptionId],
                              shopId
                            });

                            const reactionTernaryOptionId = Products.insert(reactionTernaryOption, { type: "variant" });
                            ids.push(reactionTernaryOptionId);
                            Logger.info(`Imported ${shopifyProduct.title} ${variant}/${option}/${ternaryOption}`);

                            // Update Max Price
                            if (price.max === null || price.max < reactionTernaryOption.price) {
                              price.max = reactionTernaryOption.price;
                            }

                            // Update Min Price
                            if (price.min === null || price.min > reactionTernaryOption.price) {
                              price.min = reactionTernaryOption.price;
                            }

                            // Save all relevant variant images to our option
                            const ternaryOptionImages = findVariantImages(shopifyOption.id, shopifyProduct.images);
                            ternaryOptionImages.forEach((imageObj) => {
                              saveImage(imageObj.src, {
                                ownerId: Meteor.userId(),
                                productId: reactionProductId,
                                variantId: reactionOptionId,
                                shopId: shopId,
                                priority: 1,
                                toGrid: 0
                              });
                            });
                          }
                        }); // So many close parens and brackets. Don't get lost.
                      }
                    }
                  });
                } else {
                // Product does not have options, just variants
                  // Update Max Price
                  if (price.max === null || price.max < reactionVariant.price) {
                    price.max = reactionVariant.price;
                  }

                  // Update Min Price
                  if (price.min === null || price.min > reactionVariant.price) {
                    price.min = reactionVariant.price;
                  }

                  // Save all relevant variant images to our variant.
                  const variantImages = findVariantImages(shopifyVariant.id, shopifyProduct.images);
                  variantImages.forEach((imageObj) => {
                    saveImage(imageObj.src, {
                      ownerId: Meteor.userId(),
                      productId: reactionProductId,
                      variantId: reactionVariantId,
                      shopId: shopId,
                      priority: 1,
                      toGrid: 0
                    });
                  });
                  Logger.info(`Imported ${shopifyProduct.title} ${variant}`);
                }
              }
            });
          }

          // Set final product price
          if (price.min !== price.max) {
            price.range = `${price.min} - ${price.max}`;
          } else {
            price.range = `${price.max}`;
          }
          Products.update({ _id: reactionProductId }, { $set: { price: price } }, { selector: { type: "simple" } });
        }); // End product loop

        // Update the API pagination with the last productId we fetched
        opts.since_id = shopifyProducts[shopifyProducts.length - 1].id;
      } // End pages loop
      Logger.info("Shopify Import Finished");
      return ids;
    } catch (error) {
      Logger.error(`Something went wrong! ${error}`);
    }
  }
};

Meteor.methods(methods);
