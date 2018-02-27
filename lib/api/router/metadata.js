import { ReactionProduct, getShopId, Reaction } from "/lib/api";
import { Shops, SellerShops } from "/lib/collections";

/**
 * MetaData
 * populates title and meta tags for routes
 * init accepts Router.current() context
 */
export const MetaData = {
  init(context) {
    const { params } = context;
    const product = ReactionProduct.selectedProduct();
    const shop = Shops.findOne(getShopId());
    const meta = [];
    let title = "";
    let description = "";
    let keywords = [];

    // case helper
    const titleCase = (param) => param.charAt(0).toUpperCase() + param.substring(1);

    // populate meta from shop
    if (shop) {
      // shop defaults
      if (shop.description) {
        description = shop.description.substring(0, 160);
      }

      if (shop.keywords) {
        keywords.push(shop.keywords.toString());
      }

      // set title defaults
      MetaData.name = shop.name;

      // product title default
      if (params && params.handle) {
        if (product && product.title) {
          title = titleCase(product.title);
        } else {
          title = titleCase(params.handle);
        }

      // tag slugs
      } else if (params && params.slug) {
        title = titleCase(params.slug);

      // fallback to route name
      } else if (context.route && context.route.name) {
        const { route } = context;
        const routeName = route.name;

        // default index to Shop Name
        if (routeName === "index") {
          title = titleCase(shop.name);

        // seller shop homepage
        } else if (routeName === "shop") {
          const currentShop = SellerShops.findOne(params.shopId);
          if (currentShop) {
            title = titleCase(currentShop.name);
          } else {
            title = titleCase(routeName);
          }
        // check for meta in package route
        } else if (route.options.meta && route.options.meta.title) {
          title = titleCase(route.options.meta.title);
        } else {
          // default routes to route's name
          title = titleCase(routeName);
        }
      }

      //  product details
      if (params && params.handle && product) {
        // discard defaults
        Reaction.DOM.removeDocHeadAddedTags();

        if (product.description) {
          description = product.description.substring(0, 160);
        }

        if (product && product.metafields) {
          // Clear shop keywords, to make keywords specific to this product page.
          keywords = [];
          for (const key of product.metafields) {
            keywords.push(key.value);
          }
        }
      }
    } // end shop

    Reaction.DOM.setMetaTag({
      name: "description",
      content: description
    });

    Reaction.DOM.setMetaTag({
      name: "keywords",
      content: keywords ? keywords.toString() : ""
    });

    // set site defaults
    document.title = title;
    MetaData.title = title;
    MetaData.meta = meta;

    return meta;
  } // end update
};
