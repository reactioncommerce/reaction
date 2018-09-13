import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schema from "./server/no-meteor/schema.graphql";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Cart",
  name: "reaction-cart",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
  },
  graphQL: {
    resolvers,
    schemas: [schema]
  },
  mutations,
  queries
});
