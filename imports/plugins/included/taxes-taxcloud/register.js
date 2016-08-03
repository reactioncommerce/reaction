import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Taxes",
  name: "taxes-taxcloud",
  icon: "fa fa-university",
  autoEnable: true,
  settings: {
    taxcloud: {
      enabled: false,
      apiLoginId: "",
      refreshPeriod: "every 4 hours",
      taxCodeUrl: "https://taxcloud.net/tic/?format=json"
    }
  },
  registry: [
    {
      label: "TaxCloud",
      name: "taxes/settings/taxcloud",
      provides: "taxSettings",
      template: "taxCloudSettings"
    },
    {
      template: "taxJarCheckoutTaxes",
      provides: "taxMethod"
    }
  ]
});
