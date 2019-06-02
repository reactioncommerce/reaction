import Reaction from "/imports/plugins/core/core/server/Reaction";
import calculateOrderTaxes from "./server/no-meteor/util/calculateOrderTaxes";
import getTaxCodes from "./server/no-meteor/util/getTaxCodes";

Reaction.registerPackage({
  label: "Custom Rates",
  name: "reaction-taxes-rates",
  icon: "fa fa-university",
  autoEnable: true,
  collections: {
    Taxes: {
      name: "Taxes",
      indexes: [
        // Create indexes. We set specific names for backwards compatibility
        // with indexes created by the aldeed:schema-index Meteor package.
        [{ country: 1 }, { name: "c2_country" }],
        [{ postal: 1 }, { name: "c2_postal" }],
        [{ region: 1 }, { name: "c2_region" }],
        [{ shopId: 1 }, { name: "c2_shopId" }],
        [{ taxCode: 1 }, { name: "c2_taxCode" }]
      ]
    },
    TaxCodes: {
      name: "TaxCodes"
    }
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
