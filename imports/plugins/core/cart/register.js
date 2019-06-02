import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Cart",
  name: "reaction-cart",
  autoEnable: true,
  collections: {
    Cart: {
      name: "Cart",
      indexes: [
        // Create indexes. We set specific names for backwards compatibility
        // with indexes created by the aldeed:schema-index Meteor package.
        [{ accountId: 1 }, { name: "c2_accountId" }],
        [{ accountId: 1, shopId: 1 }],
        [{ anonymousAccessToken: 1 }, { name: "c2_anonymousAccessToken" }],
        [{
          referenceId: 1
        }, {
          unique: true,
          // referenceId is an optional field for carts, so we want the uniqueness constraint
          // to apply only to non-null fields or the second document with value `null`
          // would throw an error.
          partialFilterExpression: {
            referenceId: {
              $type: "string"
            }
          }
        }],
        [{ shopId: 1 }, { name: "c2_shopId" }],
        [{ "items.productId": 1 }, { name: "c2_items.$.productId" }],
        [{ "items.variantId": 1 }, { name: "c2_items.$.variantId" }]
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
  queries
});
