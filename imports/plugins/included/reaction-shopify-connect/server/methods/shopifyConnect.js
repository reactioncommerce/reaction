/* eslint camelcase: 0 */
import Shopify from "shopify-api-node";
import { Meteor } from "meteor/meteor";
import { Logger } from "/server/api";
// import { check, Match } from "meteor/check";


// import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/server/api";
import { Packages } from "/lib/collections";

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
      const pages = 1; // Math.ceil(productCount / limit);
      for (let i = 0; i < pages; i++) {
        const products = await shopify.product.list(opts);

        products.forEach((product) => {
          let productVariants = [];
          let variantLabel;

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
          prod.hashtags = product.tags.split(",");
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
      }
      return ids;
    } catch (error) {
      Logger.error(`Something went wrong! ${error}`);
    }
  }
};

Meteor.methods(methods);
