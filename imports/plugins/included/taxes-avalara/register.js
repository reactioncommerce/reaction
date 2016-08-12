import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Avalara",
  name: "taxes-avalara",
  icon: "fa fa-university",
  autoEnable: false,
  provides: "taxes",
  settings: {
    avalara: {
      enabled: false,
      apiLoginId: ""
    }
  },
  registry: [
    {
      label: "Avalara",
      name: "taxes/settings/avalara",
      provides: "taxSettings",
      template: "avalaraSettings"
    },
    {
      template: "avalaraCheckoutTaxes",
      provides: "taxMethod"
    }
  ]
});
