import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Connectors",
  name: "reaction-shopify-connect",
  icon: "fa fa-exchange",
  autoEnable: true,
  settings: {
    apiKey: "",
    password: "",
    sharedSecret: "",
    shopifyDomaindomain: ""
  },
  registry: [{
    label: "Shopify Connector Settings",
    icon: "fa fa-exchange",
    route: "/dashboard/connectors/shopify",
    provides: "connectorSettings",
    container: "dashboard",
    template: "reactionConnectorSettings"
  }]
});
