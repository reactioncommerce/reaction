import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
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
