import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Avalara",
  name: "taxes-avalara",
  icon: "fa fa-university",
  autoEnable: true,
  settings: {
    avalara: {
      enabled: false,
      apiLoginId: ""
    },
    addressValidation: {
      enabled: false,
      addressValidationMethod: "avalara/addressValidation"
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
      label: "Avalara Address Validation",
      name: "addressValidation/avalara",
      provides: "addressValidation"
    }
  ]
});
