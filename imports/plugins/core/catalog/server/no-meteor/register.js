import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Catalog",
    name: "reaction-catalog",
    icon: "fa fa-book",
    autoEnable: true,
    collections: {
      Catalog: {
        name: "Catalog",
        indexes: [
          // Without _id: 1 on these, they cannot be used for sorting by createdAt
          // because all sorts include _id: 1 as secondary sort to be fully stable.
          [{ createdAt: 1, _id: 1 }],
          [{ updatedAt: 1, _id: 1 }],
          [{ shopId: 1 }],
          [{ "product._id": 1 }],
          [{ "product.productId": 1 }],
          [{ "product.slug": 1 }],
          [{ "product.tagIds": 1 }]
        ]
      }
    },
    functionsByType: {
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
    }
  });
}
