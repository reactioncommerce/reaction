import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Random } from "meteor/random";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
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
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} _id
 * @property {String} fullName required
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
    type: Boolean
  },
  "isBillingDefault": {
    label: "Make this your default billing address?",
    type: Boolean
  },
  "isShippingDefault": {
    label: "Make this your default shipping address?",
    type: Boolean
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
}, { check, tracker: Tracker });

registerSchema("Address", Address);
