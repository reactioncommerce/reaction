import Reaction from "/imports/plugins/core/core/server/Reaction";
import calculateOrderTaxes from "./server/no-meteor/util/calculateOrderTaxes";
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
        calculateOrderTaxes,
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
