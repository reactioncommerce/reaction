import Reaction from "/imports/plugins/core/core/server/Reaction";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "Google Web Tools",
  name: "google-webtools",
  icon: "fa fa-search-plus",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas
  },
  settings: {
    enabled: true,
    public: {
      siteVerificationToken: ""
    }
  },
  registry: [{
    label: "Google Web Tools",
    icon: "fa fa-search-plus",
    provides: ["shopSettings"],
    container: "dashboard",
    template: "googleWebToolsSettings",
    showForShopTypes: ["primary"]
  }]
});
