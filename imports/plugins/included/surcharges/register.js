import Reaction from "/imports/plugins/core/core/server/Reaction";
import resolvers from "./server/no-meteor/resolvers";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import schemas from "./server/no-meteor/schemas";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Surcharges",
  name: "reaction-surcharges",
  icon: "fa fa-icon-money",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas
  },
  mutations,
  queries,
  functionsByType: {
    startup: [startup]
  }
});
