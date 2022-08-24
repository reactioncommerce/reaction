import pkg from "../package.json";
import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import { registerPluginHandlerForCatalog } from "./registration.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import {
  Catalog,
  CatalogProduct,
  CatalogProductOption,
  CatalogProductVariant,
  ImageInfo,
  ImageSizes,
  ShippingParcel,
  SocialMetadata
} from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Catalogs",
    name: "catalogs",
    version: pkg.version,
    i18n,
    collections: {
      Catalog: {
        name: "Catalog",
        indexes: [
          // Without _id: 1 on these, they cannot be used for sorting by createdAt
          // because all sorts include _id: 1 as secondary sort to be fully stable.
          [{ createdAt: 1, _id: 1 }],
          [{ updatedAt: 1, _id: 1 }],
          [{ shopId: 1 }],
          [{ "product._id": 1 }, { unique: true }],
          [{ "product.productId": 1 }, { unique: true }],
          [{ "product.slug": 1 }],
          [{ "product.tagIds": 1 }],
          // Name field is needed due to MongoDB max index name size of 127 chars
          [
            {
              "product.barcode": "text",
              "product.description": "text",
              "product.metafields.key": "text",
              "product.metafields.value": "text",
              "product.metaDescription": "text",
              "product.pageTitle": "text",
              "product.sku": "text",
              "product.slug": "text",
              "product.title": "text",
              "product.vendor": "text"
            },
            {
              name: "product_search_index"
            }
          ]
        ]
      }
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForCatalog],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    simpleSchemas: {
      ImageInfo,
      ImageSizes,
      ShippingParcel,
      SocialMetadata,
      CatalogProductOption,
      CatalogProductVariant,
      CatalogProduct,
      Catalog
    }
  });
}
