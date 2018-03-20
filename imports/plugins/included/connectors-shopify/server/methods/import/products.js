/* eslint camelcase: 0 */
import Shopify from "shopify-api-node";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Meteor } from "meteor/meteor";
import { Logger, Reaction } from "/server/api";
import { check, Match } from "meteor/check";
import { Products, Jobs, Tags } from "/lib/collections";
import { getApiInfo } from "../api/api";
import { connectorsRoles } from "../../lib/roles";
import { importImages } from "../../jobs/image-import";

/**
 * @file Shopify connector import product method
 *       contains methods and helpers for setting up and removing synchronization between
 *       a Shopify store and a Reaction shop
 * @module connectors-shopify
 */

/**
 * Transforms a Shopify product into a Reaction product.
 * @private
 * @method createReactionProductFromShopifyProduct
 * @param  {object} options Options object
 * @param  {object} options.shopifyProduct the Shopify product object
 * @param  {string} options.shopId The shopId we're importing for
 * @param  {array} options.hashtags An array of hashtag strings that should be attached to this product.
 * @return {object} An object that fits the `Product` schema
 *
 * @todo consider abstracting private Shopify import helpers into a helpers file
 */
function createReactionProductFromShopifyProduct(options) {
  const { shopifyProduct, shopId, hashtags } = options;
  const reactionProduct = {
    ancestors: [],
    createdAt: new Date(),
    description: shopifyProduct.body_html.replace(/(<([^>]+)>)/ig, ""), // Strip HTML
    handle: shopifyProduct.handle,
    hashtags,
    isDeleted: false,
    isVisible: false,
    isSoldOut: false,
    isLowQuantity: false,
    isBackorder: false,
    metafields: [],
    pageTitle: shopifyProduct.pageTitle,
    price: { range: "0" },
    productType: shopifyProduct.product_type,
    requiresShipping: true,
    shopId, // set shopId to active shopId;
    shopifyId: shopifyProduct.id.toString(), // save it here to make sync lookups cheaper
    template: "productDetailSimple",
    title: shopifyProduct.title,
    type: "simple",
    updatedAt: new Date(),
    vendor: shopifyProduct.vendor,
    workflow: {
      status: "new",
      workflow: ["imported"]
    },
    skipRevision: true
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
 * @private
 * @method createReactionVariantFromShopifyVariant
 * @param  {object} options { shopifyVariant, variant, index, ancestors, shopId }
 * @return {object} An object that fits the `ProductVariant` schema
 */
function createReactionVariantFromShopifyVariant(options) {
  const { shopifyVariant, variant, index, ancestors, shopId } = options;
  const reactionVariant = {
    ancestors,
    barcode: shopifyVariant.barcode,
    compareAtPrice: shopifyVariant.compare_at_price,
    createdAt: new Date(),
    height: 0,
    index,
    inventoryManagement: true,
    inventoryPolicy: shopifyVariant.inventory_policy === "deny",
    inventoryQuantity: shopifyVariant.inventory_quantity >= 0 ? shopifyVariant.inventory_quantity : 0,
    isDeleted: false,
    isVisible: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
    metafields: [],
    optionTitle: variant,
    price: parseFloat(shopifyVariant.price),
    requiresShipping: shopifyVariant.requires_shipping,
    shopId,
    shopifyId: shopifyVariant.id.toString(), // Save for easy sync lookups
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
      workflow: ["imported"]
    },
    skipRevision: true
  };

  if (shopifyVariant.inventory_management === null) {
    reactionVariant.inventoryQuantity = 0;
    reactionVariant.inventoryManagement = false;
  }

  return reactionVariant;
}

/**
 * Finds the images associated with a particular shopify variant
 * @private
 * @method findVariantImages
 * @param  {number} shopifyVariantId The variant `id` from shopify
 * @param  {array} images An array of image objects from a Shopify product
 * @return {array} Returns an array of image objects that match the passed shopifyVariantId
 */
function findVariantImages(shopifyVariantId, images) {
  return images.filter((imageObj) => imageObj.variant_ids.indexOf(shopifyVariantId) !== -1);
}

/**
 * Finds the images associated with a particular shopify variant
 * @method findProductImages
 * @private
 * @param  {number} shopifyProductId The product `id` from shopify
 * @param  {array} images An array of image objects from a Shopify product
 * @return {array} Returns an array of image objects that match the passed shopifyProductId
 */
function findProductImages(shopifyProductId, images) {
  return images.filter((imageObj) => imageObj.product_id === shopifyProductId);
}


/**
 * cache all existing tags to memory {slug => id} so that when we're importing products we can
 * lookup tags without a database call.
 * @method createTagCache
 * @private
 * @return {object} Dictionary of tag slugs mapping to the associated _id
 * @todo: For apps with large collections of tags (5k+), this may be less desirable than checking each tag against mongo
 *        That would cause each product tag we find to hit the database at least once. We could make this optional
 */
function createTagCache() {
  return Tags.find({}).fetch().reduce((cache, tag) => {
    if (!cache[tag.slug]) {
      cache[tag.slug] = tag._id;
    }
    return cache;
  }, {});
}


/**
 * Finds and returns arrays of option values for each of Shopify's option layers
 * returns an object consisting of the following three values:
 * shopifyVariants representing the first option on the shopify product (`option1` in the variant)
 * shopifyOptions representing the second option on the shopify product (`option2` in the variant)
 * shopifyTernary representing the third option on the shopify product (`option3` in the variant)
 * any of these will return undefined if the product does not have an option at that layer.
 * @private
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
 * @private
 * @method normalizeWeight
 * @param  {number} weight weight of the product in grams
 * @return {number} weight of the product in the shop's default unitsOfMeasure
 * @todo get store unitsOfMeasure, convert to store unitsOfMeasure from grams, return converted weight
 */
function normalizeWeight(weight) {
  return weight;
}

/**
 * Creates a new job to save an image from a given url
 * Saves an image from a url to the Collection FS image storage location
 * (default: Mongo GridFS)
 * @private
 * @method saveImage
 * @param  {string}  url url of the image to save
 * @param  {object}  metadata metadata to save with the image
 * @return {undefined}
 */
function saveImage(url, metadata) {
  new Job(Jobs, "connectors/shopify/import/image", { url, metadata })
    .priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential" // delay by twice as long for each subsequent retry
    }).save();
}

export const methods = {
  /**
   * Imports products for the active Reaction Shop from Shopify with the API credentials setup for that shop.
   *
   * @async
   * @method connectors/shopify/import/products
   * @param {object} options An object of options for the shopify API call. Available options here: https://help.shopify.com/api/reference/product#index
   * @returns {array} An array of the Reaction product _ids (including variants and options) that were created.
   */
  async "connectors/shopify/import/products"(options) {
    check(options, Match.Maybe(Object));
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const apiCreds = getApiInfo();
    const shopify = new Shopify(apiCreds);
    const shopId = Reaction.getShopId();
    const limit = 50; // Shopify returns a maximum of 250 results per request
    const tagCache = createTagCache();
    const ids = [];
    const opts = Object.assign({}, {
      published_status: "published",
      limit
    }, { ...options });

    try {
      const productCount = await shopify.product.count();
      const numPages = Math.ceil(productCount / limit);
      const pages = [...Array(numPages).keys()];
      Logger.info(`Shopify Connector is preparing to import ${productCount} products`);

      for (const page of pages) {
        Logger.debug(`Importing page ${page + 1} of ${numPages} - each page has ${limit} products`);
        const shopifyProducts = await shopify.product.list({ ...opts, page }); // eslint-disable-line no-await-in-loop
        for (const shopifyProduct of shopifyProducts) {
          if (!Products.findOne({ shopifyId: shopifyProduct.id }, { fields: { _id: 1 } })) {
            Logger.debug(`Importing ${shopifyProduct.title}`);
            const price = { min: null, max: null, range: "0.00" };
            let isSoldOut = true;
            let isBackorder = false;

            // Get tags from shopify and register them if they don't exist.
            // push tag Id's into our hashtags array for use in the product
            // We can't load all tags beforehand because Shopify doesn't have a tags API
            const hashtags = [];
            const shopifyTags = shopifyProduct.tags.split(",");
            for (const tag of shopifyTags) {
              if (tag !== "") {
                const normalizedTag = {
                  name: tag,
                  slug: Reaction.getSlug(tag),
                  shopId,
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
              }
            }

            // Get Shopify variants, options and ternary options
            const { shopifyVariants, shopifyOptions, shopifyTernaryOptions } = getShopifyVariantsAndOptions(shopifyProduct);

            // Setup reaction product
            const reactionProduct = createReactionProductFromShopifyProduct({ shopifyProduct, shopId, hashtags });

            // Insert product, save id
            const reactionProductId = Products.insert(reactionProduct, { selector: { type: "simple" }, publish: true });
            ids.push(reactionProductId);

            // Save the primary image to the grid and as priority 0
            saveImage(shopifyProduct.image.src, {
              ownerId: Meteor.userId(),
              productId: reactionProductId,
              variantId: reactionProductId,
              shopId,
              priority: 0,
              toGrid: 1
            });

            // Save all remaining product images to product
            const productImages = findProductImages(shopifyProduct.id, shopifyProduct.images);
            for (const productImage of productImages) {
              if (shopifyProduct.image.id !== productImage.id) {
                saveImage(productImage.src, {
                  ownerId: Meteor.userId(),
                  productId: reactionProductId,
                  variantId: reactionProductId,
                  shopId,
                  priority: productImage.position, // Shopify index positions starting at 1.
                  toGrid: 0
                });
              }
            }

            // If variantLabel exists, we have at least one variant
            if (shopifyVariants) {
              Logger.debug(`Importing ${shopifyProduct.title} variants`);

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
                  const reactionVariantId = Products.insert(reactionVariant, { publish: true });
                  ids.push(reactionVariantId);

                  // If we have shopify options, create reaction options
                  if (shopifyOptions) {
                    Logger.debug(`Importing ${shopifyProduct.title} ${variant} options`);
                    shopifyOptions.forEach((option, j) => {
                      // Find the option that nests under our current variant.
                      const shopifyOption = shopifyProduct.variants.find((o) => o.option1 === variant && o.option2 === option);

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
                        Logger.debug(`Imported ${shopifyProduct.title} ${variant}/${option}`);

                        // Update max price
                        if (price.max === null || price.max < reactionOption.price) {
                          price.max = reactionOption.price;
                        }

                        // Update min price
                        if (price.min === null || price.min > reactionOption.price) {
                          price.min = reactionOption.price;
                        }

                        // Update denormalized sold out status
                        if (isSoldOut && reactionOption.inventoryQuantity > 0) {
                          isSoldOut = false;
                        }

                        // Update denormalized backordered status
                        // if at least one variant has inventoryPolicy = false, then the product isBackorder
                        if (!isBackorder) {
                          isBackorder = !reactionOption.inventoryPolicy;
                        }

                        // Save all relevant variant images to our option
                        const optionImages = findVariantImages(shopifyOption.id, shopifyProduct.images);
                        for (const [index, optionImage] of optionImages.entries()) {
                          saveImage(optionImage.src, {
                            ownerId: Meteor.userId(),
                            productId: reactionProductId,
                            variantId: reactionOptionId,
                            shopId,
                            priority: 1,
                            toGrid: index === 0 ? 1 : 0 // We save the first of each variant image to the grid
                          });
                        }

                        // THIS LOOP INSERTS PRODUCTS A LEVEL DEEPER THAN THE REACTION
                        // UI CURRENTLY SUPPORTS. IF YOUR SHOPIFY STORE USES THREE OPTION
                        // LEVELS, YOU WILL NEED TO BUILD UI SUPPORT FOR THAT.
                        if (shopifyTernaryOptions) {
                          Logger.warn("Importing shopify product with 3 options. The Reaction UI does not currently support this.");
                          Logger.debug(`Importing ${shopifyProduct.title} ${variant} ${option} options`);
                          shopifyTernaryOptions.forEach((ternaryOption, k) => {
                            // Find the option that nests under our current variant.
                            const shopifyTernaryOption = shopifyProduct.variants.find((o) => o.option1 === variant && o.option2 === option && o.option3 === ternaryOption); // eslint-disable-line max-len

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
                              Logger.debug(`Imported ${shopifyProduct.title} ${variant}/${option}/${ternaryOption}`);

                              // Update max price
                              if (price.max === null || price.max < reactionTernaryOption.price) {
                                price.max = reactionTernaryOption.price;
                              }

                              // Update min price
                              if (price.min === null || price.min > reactionTernaryOption.price) {
                                price.min = reactionTernaryOption.price;
                              }

                              // Update denormalized sold out status
                              if (isSoldOut && reactionTernaryOption.inventoryQuantity > 0) {
                                isSoldOut = false;
                              }

                              // Update denormalized backordered status
                              // if at least one variant has inventoryPolicy = false, then the product isBackorder
                              if (!isBackorder) {
                                isBackorder = !reactionTernaryOption.inventoryPolicy;
                              }

                              // Save all relevant variant images to our option
                              const ternaryOptionImages = findVariantImages(shopifyTernaryOption.id, shopifyProduct.images);
                              for (const [index, ternaryOptionImage] of ternaryOptionImages.entries()) {
                                saveImage(ternaryOptionImage.src, {
                                  ownerId: Meteor.userId(),
                                  productId: reactionProductId,
                                  variantId: reactionOptionId,
                                  shopId,
                                  priority: 1,
                                  toGrid: index === 0 ? 1 : 0 // We save the first of each variant image to the grid
                                });
                              } // So many close parens and brackets. Don't get lost.
                            }
                          }); // End shopifyTernaryOptions forEach loop
                        }
                      }
                    }); // End shopifyOptions forEach loop
                  } else {
                    // Product does not have options, just variants
                    // Update max price
                    if (price.max === null || price.max < reactionVariant.price) {
                      price.max = reactionVariant.price;
                    }

                    // Update min price
                    if (price.min === null || price.min > reactionVariant.price) {
                      price.min = reactionVariant.price;
                    }

                    // Update denormalized sold out status
                    if (isSoldOut && reactionVariant.inventoryQuantity > 0) {
                      isSoldOut = false;
                    }

                    // Update denormalized backordered status
                    // if at least one variant has inventoryPolicy = false, then the product isBackorder
                    if (!isBackorder) {
                      isBackorder = !reactionVariant.inventoryPolicy;
                    }

                    // Save all relevant variant images to our variant.
                    const variantImages = findVariantImages(shopifyVariant.id, shopifyProduct.images);
                    for (const [index, variantImage] of variantImages.entries()) {
                      saveImage(variantImage.src, {
                        ownerId: Meteor.userId(),
                        productId: reactionProductId,
                        variantId: reactionVariantId,
                        shopId,
                        priority: 1,
                        toGrid: index === 0 ? 1 : 0 // We save the first of each variant image to the grid
                      });
                    }
                    Logger.debug(`Imported ${shopifyProduct.title} ${variant}`);
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
            Products.update({
              _id: reactionProductId
            }, {
              $set: {
                price,
                isSoldOut,
                isBackorder
              }
            }, { selector: { type: "simple" }, publish: true });

            Logger.debug(`Product ${shopifyProduct.title} added`);
          } else { // product already exists check
            Logger.debug(`Product ${shopifyProduct.title} already exists`);
          }
        } // End product loop
      } // End pages loop
      Logger.info(`Reaction Shopify Connector has finished importing ${ids.length} products and variants`);

      // Run jobs to import all queued images;
      importImages();
      return ids;
    } catch (error) {
      Logger.error("There was a problem importing your products from Shopify", error);
      throw new Meteor.Error("There was a problem importing your products from Shopify", error);
    }
  }
};

Meteor.methods(methods);
