import Reaction from "/imports/plugins/core/core/server/Reaction";

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
      taxCodeUrl: "https://taxcloud.net/tic/json"
    },
    taxCodes: {
      getTaxCodeMethod: "taxcloud/getTaxCodes"
    }
  },
  registry: [
    {
      label: "TaxCloud",
      name: "taxes/settings/taxcloud",
      provides: ["taxSettings"],
      template: "taxCloudSettings"
    },
    {
      label: "TaxCloud Tax Codes",
      provides: ["taxCodes"],
      name: "taxes/taxcodes/taxcloud"
    }
  ]
});
