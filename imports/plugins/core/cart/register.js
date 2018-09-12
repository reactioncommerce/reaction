import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Cart",
  name: "reaction-cart",
  autoEnable: true,
  graphQL: {
    resolvers
  },
  mutations,
  queries,
  startupFunctions: [startup]
});
