import Reaction from "/imports/plugins/core/core/server/Reaction";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

/**
 * @file Address core plugin
 *
 * @namespace Address
 */

Reaction.registerPackage({
  label: "Address",
  name: "reaction-address",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas
  },
  queries,
  registry: [
    {
      label: "Address Validation",
      provides: ["shopSettings"],
      container: "dashboard",
      template: "ShopAddressValidationSettings"
    }
  ]
});
