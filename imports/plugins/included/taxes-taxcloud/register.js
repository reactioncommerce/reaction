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
      apiKey: "",
      refreshPeriod: "every 7 days",
      taxCodeUrl: "https://taxcloud.net/tic/?format=json"
    }
  },
  registry: [
    {
      label: "TaxCloud",
      name: "taxes/settings/taxcloud",
      provides: "taxSettings",
      template: "taxCloudSettings"
    }
  ]
});
