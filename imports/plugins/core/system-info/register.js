import Reaction from "/imports/plugins/core/core/server/Reaction";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "System Information",
  name: "reaction-systeminfo",
  icon: "fa fa-info",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas
  },
  queries
});
