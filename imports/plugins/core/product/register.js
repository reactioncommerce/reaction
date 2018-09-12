import Reaction from "/imports/plugins/core/core/server/Reaction";
import resolvers from "./server/no-meteor/resolvers";

Reaction.registerPackage({
  label: "Product",
  name: "reaction-product",
  autoEnable: true,
  graphQL: {
    resolvers
  }
});
