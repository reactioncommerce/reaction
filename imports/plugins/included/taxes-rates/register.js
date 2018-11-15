import Reaction from "/imports/plugins/core/core/server/Reaction";
import calculateOrderGroupTaxes from "./server/no-meteor/util/calculateOrderGroupTaxes";
import getTaxCodes from "./server/no-meteor/util/getTaxCodes";

Reaction.registerPackage({
  label: "Custom Rates",
  name: "reaction-taxes-rates",
  icon: "fa fa-university",
  autoEnable: true,
  taxServices: [
    {
      displayName: "Custom Rates",
      name: "custom-rates",
      functions: {
        calculateOrderGroupTaxes,
        getTaxCodes
      }
    }
  ],
  registry: [
    {
      label: "Custom Rates",
      name: "taxes/settings/rates",
      provides: ["taxSettings"],
      template: "customTaxRates"
    }
  ]
});
