import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import { registerPluginHandler } from "./registration.js";
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
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Catalog",
    name: "reaction-catalog",
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
          [{ "product.tagIds": 1 }]
        ]
      }
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandler],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    settings: {
      name: "Catalog"
    },
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
