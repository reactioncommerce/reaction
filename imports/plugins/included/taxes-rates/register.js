import Reaction from "/imports/plugins/core/core/server/Reaction";
import calculateOrderTaxes from "./server/no-meteor/util/calculateOrderTaxes";
import getTaxCodes from "./server/no-meteor/util/getTaxCodes";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Custom Rates",
  name: "reaction-taxes-rates",
  icon: "fa fa-university",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
  },
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
