import Random from "@reactioncommerce/random";
import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { Metafield } from "./metafield";

const withoutCodeCountries = ["AO", "AG", "AW", "BS", "BZ", "BJ", "BW",
  "BF", "BI", "CM", "CF", "KM", "CG", "CD", "CK", "CI", "DJ",
  "DM", "GQ", "ER", "FJ", "TF", "GM", "GH", "GD", "GN", "GY",
  "HK", "IE", "JM", "KE", "KI", "MO", "MW", "ML", "MR", "MU",
  "MS", "NR", "AN", "NU", "KP", "PA", "QA", "RW", "KN", "LC",
  "ST", "SA", "SC", "SL", "SB", "SO", "SR", "SY", "TZ", "TL",
  "TK", "TO", "TT", "TV", "UG", "AE", "VU", "YE", "ZW"];

/**
 * @name Address
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id
 * @property {String} fullName required
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} address1 required
 * @property {String} address2
 * @property {String} city required
 * @property {String} company
 * @property {String} phone required
 * @property {String} region required, State/Province/Region
 * @property {String} postal required
 * @property {String} country required
 * @property {Boolean} isCommercial required
 * @property {Boolean} isBillingDefault required
 * @property {Boolean} isShippingDefault required
 * @property {Boolean} failedValidation
 * @property {Metafield[]} metafields
 */
export const Address = new SimpleSchema({
  "_id": {
    type: String,
    defaultValue: Random.id(),
    optional: true
  },
  "fullName": {
    type: String,
    label: "Full name"
  },
  "firstName": {
    type: String,
    label: "First name",
    optional: true
  },
  "lastName": {
    type: String,
    label: "Last name",
    optional: true
  },
  "address1": {
    label: "Address 1",
    type: String
  },
  "address2": {
    label: "Address 2",
    type: String,
    optional: true
  },
  "city": {
    type: String,
    label: "City"
  },
  "company": {
    type: String,
    label: "Company",
    optional: true
  },
  "phone": {
    type: String,
    label: "Phone"
  },
  "region": {
    label: "State/Province/Region",
    type: String
  },
  "postal": {
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
  "country": {
    type: String,
    label: "Country"
  },
  "isCommercial": {
    label: "This is a commercial address.",
    type: Boolean,
    defaultValue: false
  },
  "isBillingDefault": {
    label: "Make this your default billing address?",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "isShippingDefault": {
    label: "Make this your default shipping address?",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "failedValidation": {
    label: "Failed validation",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  }
});

registerSchema("Address", Address);


const ErrorDetails = new SimpleSchema({
  message: {
    type: String
  },
  description: {
    type: String,
    optional: true
  }
});

// Validate that whenever we return an error we return the same format
export const ErrorObject = new SimpleSchema({
  "type": {
    type: String
  },
  "errorCode": {
    type: Number
  },
  "errorDetails": {
    type: Array,
    optional: true
  },
  "errorDetails.$": {
    type: ErrorDetails,
    optional: true
  }
});
