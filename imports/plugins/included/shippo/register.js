import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Shippo",
  name: "reaction-shippo",
  icon: "fa fa-plane",
  autoEnable: true,
  settings: {
    shippo: {
      enabled: true
    },
    apiKey: ""
  },
  registry: [{
    provides: "dashboard",
    label: "Shippo",
    description: "Shippo service",
    icon: "fa fa-plane",
    priority: 1,
    container: "connect",
    permissions: [{
      label: "Shippo",
      permission: "dashboard/shippo"
    }]
  }, {
    label: "Shippo",
    route: "/dashboard/shippo",
    provides: "settings",
    container: "connection",
    template: "shippoSettings"
  }
  //, {
    // provides: "shippingMethod",
    // name: "shipping/methods/shippo",
    // template: "shippoCheckoutShipping"
    // Not needed at the time cause the coreCheckoutShipping is enough(inherited from Flatrate)
  //}
  ]
});
