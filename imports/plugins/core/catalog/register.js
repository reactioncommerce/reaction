import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "Catalog",
  name: "reaction-catalog",
  icon: "fa fa-book",
  autoEnable: true,
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
