import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import checkoutSchema from "./server/no-meteor/checkout.graphql";
import schema from "./server/no-meteor/schema.graphql";

Reaction.registerPackage({
  label: "Catalog",
  name: "reaction-catalog",
  icon: "fa fa-book",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas: [schema, checkoutSchema]
  },
  mutations,
  queries,
  settings: {
    name: "Catalog"
  }
});
