import { Random } from "meteor/random";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";
import { Metafield } from "./shops";

/**
* ReactionCore Schemas Email
*/

export const Email = new SimpleSchema({
  provides: {
    type: String,
    defaultValue: "default",
    optional: true
  },
  address: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  verified: {
    type: Boolean,
    defaultValue: false,
    optional: true
  }
});

/**
* ReactionCore Schemas Address
*/

export const Address = new SimpleSchema({
  _id: {
    type: String,
    defaultValue: Random.id(),
    optional: true
  },
  fullName: {
    type: String,
    label: "Full name"
  },
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
  company: {
    type: String,
    label: "Company",
    optional: true
  },
  phone: {
    type: String,
    label: "Phone"
  },
  region: {
    label: "State/Province/Region",
    type: String
  },
  postal: {
    label: "ZIP/Postal Code",
    type: String
  },
  country: {
    type: String,
    label: "Country"
  },
  isCommercial: {
    label: "This is a commercial address.",
    type: Boolean
  },
  isBillingDefault: {
    label: "Make this your default billing address?",
    type: Boolean
  },
  isShippingDefault: {
    label: "Make this your default shipping address?",
    type: Boolean
  },
  metafields: {
    type: [Metafield],
    optional: true
  }
});
