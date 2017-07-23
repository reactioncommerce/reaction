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
          // Setup reaction product
          const prod = {};
          prod.title = product.title;
          prod.pageTitle = product.pageTitle;
          prod.description = product.body_html.replace(/(<([^>]+)>)/ig, "");
          prod.vendor = product.vendor;
          prod.productType = product.product_type;
          prod.handle = product.handle;
          prod.hashtags = product.tags.split(",");
          prod.metafields = [];
          prod.metafields.shopifyId = product.id.toString(); // keep shopifyId for future use.
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
