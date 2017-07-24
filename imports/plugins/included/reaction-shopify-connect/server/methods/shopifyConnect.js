/* eslint camelcase: 0 */
import Shopify from "shopify-api-node";
import { Meteor } from "meteor/meteor";
import { Logger } from "/server/api";
// import { check, Match } from "meteor/check";


// import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/server/api";
import { Packages, Tags } from "/lib/collections";

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
    // .then((count) =>{
    //   return count;
    // })
    // .catch((error) => {
    //   Logger.error(`Error ${error}`);
    // });
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
      }
    };
    let ids = [];

    try {
      // const productCount = await shopify.product.count();
      const pages = [...Array(1)]; // Math.ceil(productCount / limit);
      pages.forEach(async () => {
        const products = await shopify.product.list(opts);

        products.forEach((product) => {
          let productVariants = [];
          let variantLabel;
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
              throw new Meteor.Error(
                `This importer cannot currently handle more than two product options.
                Shopify product with ID: ${product.id} not imported`
              );
            }
            // This product has variants
            if (product.options.length > 0) {
              productVariants = product.options[0].values;
              variantLabel = product.options[0].name;
            }

            // This product has options
            if (product.options.length > 1) {
              // nest options underneath variants.
            } else {
              // variants exist under product
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

          // console.log(products[15]);
          // console.log(products[15].variants[0]);
          // console.log(products[15].options[0]);
          // console.log(products[15].images[0]);
          opts.since_id = products[products.length - 1].id;
          ids = [...ids, ...products.map(p => p.id)];
        });
        return ids;
      });
    } catch (error) {
      Logger.error(`Something went wrong! ${error}`);
    }
  }
};

Meteor.methods(methods);
