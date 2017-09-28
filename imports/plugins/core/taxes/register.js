import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Taxes",
  name: "reaction-taxes",
  icon: "fa fa-university",
  autoEnable: true,
  settings: {
    custom: {
      enabled: true
    },
    rates: {
      enabled: false
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      name: "taxes",
      label: "Taxes",
      description: "Provide tax rates",
      icon: "fa fa-university",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      label: "Tax Settings",
      icon: "fa fa-university",
      name: "taxes/settings",
      provides: ["settings"],
      template: "taxSettings"
    },
    {
      label: "Custom Rates",
      name: "taxes/settings/rates",
      provides: ["taxSettings"],
      template: "customTaxRates"
    },
    {
      template: "flatRateCheckoutTaxes",
      provides: ["taxMethod"]
    }
  ]
});
