import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Shopify Connect",
  name: "reaction-connectors-shopify",
  icon: "fa fa-exchange",
  autoEnable: true,
  settings: {
    apiKey: "",
    password: "",
    sharedSecret: "",
    shopName: "",
    webhooks: [],
    webhooksDomain: ""
  },
  registry: [{
    label: "Shopify Connect Settings",
    name: "settings/connectors/shopify",
    icon: "fa fa-exchange",
    route: "/dashboard/connectors/shopify",
    provides: ["connectorSettings"],
    container: "dashboard",
    template: "shopifyConnectSettings"
  }]
});
