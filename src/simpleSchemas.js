import SimpleSchema from "simpl-schema";

/**
 * @name TaxRates
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Taxes schema
 */
export const TaxRates = new SimpleSchema({
  shopId: String,
  taxCode: {
    type: String,
    label: "Tax Code",
    optional: true
  },
  taxLocale: {
    label: "Taxation Location",
    type: String,
    allowedValues: ["origin", "destination"]
  },
  region: {
    label: "State/Province/Region",
    type: String,
    optional: true
  },
  postal: {
    label: "ZIP/Postal Code",
    type: String,
    optional: true
  },
  country: {
    type: String,
    label: "Country",
    optional: true
  },
  rate: Number
});
