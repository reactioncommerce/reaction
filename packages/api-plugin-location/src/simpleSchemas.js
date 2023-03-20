import SimpleSchema from "simpl-schema";
import CountryDefinitions from "@reactioncommerce/api-utils/CountryDefinitions.js";

const withoutCodeCountries = ["AO", "AG", "AW", "BS", "BZ", "BJ", "BW",
  "BF", "BI", "CM", "CF", "KM", "CG", "CD", "CK", "CI", "DJ",
  "DM", "GQ", "ER", "FJ", "TF", "GM", "GH", "GD", "GN", "GY",
  "HK", "IE", "JM", "KE", "KI", "MO", "MW", "ML", "MR", "MU",
  "MS", "NR", "AN", "NU", "KP", "PA", "QA", "RW", "KN", "LC",
  "ST", "SA", "SC", "SL", "SB", "SO", "SR", "SY", "TZ", "TL",
  "TK", "TO", "TT", "TV", "UG", "AE", "VU", "YE", "ZW"];

export const LocationAddress = new SimpleSchema({
  address1: {
    label: "Address 1",
    type: String
  },
  address2: {
    label: "Address 2",
    type: String,
    optional: true
  },
  city: {
    type: String,
    label: "City"
  },
  region: {
    label: "State/Province/Region",
    type: String,
    optional: true
  },
  postal: {
    label: "ZIP/Postal Code",
    type: String,
    optional: true,
    custom() {
      const country = this.field("country");
      if (country && country.value) {
        if (!withoutCodeCountries.includes(country.value) && !this.value) {
          return "required";
        }
      }
      return true;
    }
  },
  country: {
    type: String,
    label: "Country"
  }
});

export const Location = new SimpleSchema({
  _id: String,
  shopId: String,
  name: String,
  identifier: String,
  type: {
    type: String,
    allowedValues: ["warehouse", "store", "dropship", "marketplace"]
  },
  address: LocationAddress,
  phoneNumber: {
    type: String,
    custom() {
      const country = this.field("address.country");
      if (!this.value || !country || !country.value) return true;

      const countryDefinition = CountryDefinitions[country.value];
      if (!countryDefinition) return true;

      const { phone, name } = countryDefinition;
      return this.value.startsWith(phone) ? true : `The phone number must start with ${phone} for ${name}`;
    }
  },
  fulfillmentMethod: {
    type: String,
    allowedValues: ["shipping", "pickup", "ship-to-store", "local-delivery"]
  },
  localFulfillmentOnly: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  storeHours: {
    type: Number,
    min: 0,
    max: 24,
    optional: true
  },
  storePickupHours: {
    type: Number,
    allowedValues: [2, 4, 6, 12, 24, 48, 120, 178, 336],
    optional: true
  },
  storePickupInstructions: {
    type: String,
    optional: true
  },
  enabled: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  isArchived: {
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  createdAt: Date,
  updatedAt: Date
});
