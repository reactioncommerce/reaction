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

function saveImage(url, metadata) {
  const fileObj = new FS.File();
  fileObj.attachData(url);
  fileObj.metadata = metadata;
  Media.insert(fileObj);
}

// get Shopify Api Key, Password and Domain from the Shopify Connect package with the supplied shopId or alternatly the active shopId
function getApiInfo(shopId = Reaction.getShopId()) {
  const { settings } = Packages.findOne({
    name: "reaction-shopify-connect",
    shopId
  });

  return {
    apiKey: settings.apiKey,
    password: settings.password,
    shopName: settings.shopName
  };
}

function normalizeWeight(weight) {
  // TODO: get store unitsOfMeasure
  // convert weight in grams to store unitsOfMeasure
  return weight;
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
    const limit = 2;
    const opts = {
      published_status: "published",
      limit: limit
    };

    // Cache all tags as we discover or create them so we only ever have to look up a tag once
    // We should never have to look up a tag we've created during this import
    //
    // Start by caching all existing tags to memory in a {slug => id} tuple
    // This may need to be optimized if there are an enormous number of tags existing
    const tags = Tags.find({}).fetch().reduce((cache, tag) => {
      if (!cache[tag.slug]) {
        cache[tag.slug] = tag._id;
      }
      return cache;
    }, {});

    const defaultProduct = {
      shopId: shopId, // set shopId to active shopId;
      isVisible: false,
      type: "simple",
      ancestors: [],
      requiresShipping: true,
      isDeleted: false,
      template: "productDetailSimple",
      workflow: {
        status: "synced",
        workflow: ["imported from Shopify"]
      },
      updatedAt: new Date(),
      createdAt: new Date()
    };

    const defaultVariant = {
      shopId: shopId,
      isVisible: true,
      type: "variant",
      inventoryManagement: true,
      inventoryPolicy: true,
      metafields: [],
      taxable: true,
      isDeleted: false,
      compareAtPrice: 0,
      length: 0,
      height: 0,
      width: 0,
      lowInventoryWarningThreshold: 0,
      taxCode: "0000",
      workflow: {
        status: "synced",
        workflow: ["imported from Shopify"]
      },
      updatedAt: new Date(),
      createdAt: new Date()
    };
    const ids = [];

    try {
      const productCount = await shopify.product.count();
      const numPages = 1; // Math.ceil(productCount / limit);
      const pages = [...Array(numPages).keys()];
      Logger.info(`Preparing to import ${productCount} products`);
      for (const page of pages) {
        Logger.info(`Importing page ${page} of ${numPages}`);
        const products = await shopify.product.list(opts);

        products.forEach((product) => {
          Logger.info(`Importing ${product.title}`);
          let productVariants = [];
          let variantLabel;
          let productOptions = [];
          let optionLabel;
          const productHashtags = [];

          // Get and lookup or register tags
          // We can't load all tags beforehand because Shopify doesn't have a tags API
          product.tags.split(",").forEach((tag) => {
            const normalizedTag = {
              name: tag,
              slug: Reaction.getSlug(tag),
              shopId: shopId,
              isTopLevel: false,
              updatedAt: new Date(),
              createdAt: new Date()
            };


              // If we have a cached tag for this slug, we can skip the db check
              // otherwise we need to check the Tags db to see if it exists
            if (!tags[normalizedTag.slug]) {
              const tagExists = Tags.findOne({
                slug: normalizedTag.slug
              });

              if (tagExists) {
                // Tag found it database - add it to cache and push _id to productHashtags
                tags[normalizedTag.slug] = tagExists._id;
                productHashtags.push(tagExists._id);
              } else {
                // this tag doesn't exist, we need to:
                // create it, add it's id to our tags cache, and push _id to productHashtags
                normalizedTag._id = Tags.insert(normalizedTag);
                tags[normalizedTag.slug] = normalizedTag._id;
              }
            } else {
              // Cache hit, push the tags _id into productHashtags
              productHashtags.push(tags[normalizedTag.slug]);
            }
          });

          // Get variant and option details
          if (product.options && Array.isArray(product.options)) {
            if (product.options.length > 2) {
              // TODO: Import _AND_ throw error
              throw new Meteor.Error(
                `This importer cannot currently handle more than two product options.
                  Shopify product with ID: ${product.id} not imported`
              );
            }
            // This product has variants
            if (product.options.length > 0) {
              productVariants = [...product.options[0].values];
              variantLabel = product.options[0].name;
            }

            // This product has options
            if (product.options.length > 1) {
              productOptions = [...product.options[1].values];
              optionLabel = product.options[1].name;
            }
          }

          // Setup reaction product
          const prod = { ...defaultProduct };
          prod.title = product.title;
          prod.pageTitle = product.pageTitle;
          prod.description = product.body_html.replace(/(<([^>]+)>)/ig, "");
          prod.vendor = product.vendor;
          prod.productType = product.product_type;
          prod.handle = product.handle;
          prod.hashtags = productHashtags;
          prod.metafields = [];
          // keep shopifyId for future use.
          prod.metafields.push({
            scope: "shopify",
            key: "shopifyId",
            value: product.id.toString(),
            namespace: "shopifyProperties"
          });

          if (variantLabel) {
            prod.metafields.push({
              scope: "shopify",
              key: variantLabel,
              value: productVariants.join(", "),
              namespace: "variants"
            });
          }

          if (optionLabel) {
            prod.metafields.push({
              scope: "shopify",
              key: optionLabel,
              value: productOptions.join(", "),
              namespace: "options"
            });
          }

          // Insert product, save id
          const productId = Products.insert(prod, { type: "simple" });
          Logger.info(`Importing ${product.title}`);
          ids.push(productId);

          Logger.info("importing product image");
          saveImage(product.images[0].src, {
            ownerId: Meteor.userId(),
            productId: productId,
            variantId: productId,
            shopId: shopId,
            priority: 1
          });

          // If variantLabel exists, we have at least one variant
          if (variantLabel) {
            Logger.info(`Importing ${product.title} ${variantLabel} variants`);
            // Init productVariant
            productVariants.forEach((variant, i) => {
              const shopifyVariant = product.variants.find((v) => v.option1 === variant);

              if (shopifyVariant) {
                const reactionVariant = { ...defaultVariant };
                reactionVariant.ancestors = [productId];
                reactionVariant.index = i;
                reactionVariant.weightInGrams = shopifyVariant.grams;
                reactionVariant.weight = normalizeWeight(shopifyVariant.grams);
                reactionVariant.compareAtPrice = shopifyVariant.compare_at_price;
                reactionVariant.sku = shopifyVariant.sku;
                reactionVariant.inventoryQuantity = shopifyVariant.inventory_quantity;
                reactionVariant.price = parseFloat(shopifyVariant.price);
                reactionVariant.barcode = shopifyVariant.barcode;
                reactionVariant.requiresShipping = shopifyVariant.requires_shipping;
                reactionVariant.metafields.push({
                  scope: "shopify",
                  key: "shopifyId",
                  value: shopifyVariant.id.toString(),
                  namespace: "shopifyProperties"
                });
                reactionVariant.metafields.push({
                  scope: "shopify",
                  key: "shopifyProductId",
                  value: shopifyVariant.product_id.toString(),
                  namespace: "shopifyProperties"
                });
                reactionVariant.title = variant;
                reactionVariant.optionTitle = variant;

                const reactionVariantId = Products.insert(reactionVariant, { type: "variant" });
                ids.push(reactionVariantId);

                // If optionLabel exists, we have at least one option
                if (optionLabel) {
                  Logger.info(`Importing ${product.title} ${variant} ${optionLabel} options`);
                  productOptions.forEach((option, j) => {
                    // Find the option that nests under our current variant.
                    const shopifyOption = product.variants.find((o) => {
                      return o.option1 === variant && o.option2 === option;
                    });

                    if (shopifyOption) {
                      const reactionOption = { ...defaultVariant };
                      reactionOption.ancestors = [productId, reactionVariantId];
                      reactionOption.index = j;
                      reactionOption.weightInGrams = shopifyOption.grams;
                      reactionOption.weight = normalizeWeight(shopifyOption.grams);
                      reactionOption.compareAtPrice = shopifyOption.compare_at_price;
                      reactionOption.sku = shopifyOption.sku;
                      reactionOption.inventoryQuantity = shopifyOption.inventory_quantity;
                      reactionOption.price = parseFloat(shopifyOption.price);
                      reactionOption.barcode = shopifyOption.barcode;
                      reactionOption.requiresShipping = shopifyOption.requires_shipping;
                      reactionOption.metafields.push({
                        scope: "shopify",
                        key: "shopifyId",
                        value: shopifyOption.id.toString(),
                        namespace: "shopifyProperties"
                      });
                      reactionOption.metafields.push({
                        scope: "shopify",
                        key: "shopifyProductId",
                        value: shopifyOption.product_id.toString(),
                        namespace: "shopifyProperties"
                      });
                      reactionOption.title = option;
                      reactionOption.optionTitle = option;

                      const reactionOptionId = Products.insert(reactionOption, { type: "variant" });
                      ids.push(reactionOptionId);
                      Logger.info(`Imported ${product.title} ${variant}/${option}`);
                    }
                  });
                } else {
                  Logger.info(`Imported ${product.title} ${variant}`);
                }
              }
            });
          }
        }); // End product loop

        // Update the API pagination with the last productId we fetched
        opts.since_id = products[products.length - 1].id;
      } // End pages loop

      return ids;
    } catch (error) {
      Logger.error(`Something went wrong! ${error}`);
    }
  }
};

Meteor.methods(methods);
