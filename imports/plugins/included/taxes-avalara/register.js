import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Avalara",
  name: "taxes-avalara",
  icon: "fa fa-university",
  autoEnable: true,
  settings: {
    avalara: {
      enabled: false,
      apiLoginId: "",
      username: "",
      password: "",
      mode: false,
      commitDocuments: true,
      performTaxCalculation: true,
      enableLogging: false,
      requestTimeout: 3000,
      logRetentionDuration: 30
    },
    addressValidation: {
      enabled: true,
      countryList: ["US", "CA"],
      addressValidationMethod: "avalara/addressValidation"
    },
    taxCodes: {
      getTaxCodeMethod: "avalara/getTaxCodes"
    }
  },
  registry: [
    {
      label: "Avalara",
      name: "taxes/settings/avalara",
      provides: ["taxSettings"],
      template: "avalaraSettings"
    },
    {
      label: "Avalara Address Validation",
      name: "taxes/addressValidation/avalara",
      provides: ["addressValidation"]
    },
    {
      label: "Avalara Tax Calculation",
      provides: ["taxMethod"],
      name: "taxes/calculation/avalara"
    },
    {
      label: "Avalara Tax Codes",
      provides: ["taxCodes"],
      name: "taxes/taxcodes/avalara"
    }
  ]
});
