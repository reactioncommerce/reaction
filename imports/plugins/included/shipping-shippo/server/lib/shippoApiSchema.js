/* eslint camelcase: 0 */
import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const addressSchema = new SimpleSchema({
  object_purpose: { type: String, allowedValues: ["QUOTE", "PURCHASE"] },
  name: { type: String, optional: true },
  company: { type: String, optional: true },
  street1: { type: String, optional: true },
  street_no: { type: String, optional: true },   // only needed for DHL , the others get it from street1
  street2: { type: String, optional: true },
  city: { type: String, optional: true },
  state: { type: String, optional: true },
  zip: { type: String, optional: true },
  country: { type: String }, // maybe iso 2
  phone: { type: String, optional: true },
  email: { type: String, regEx: SimpleSchema.RegEx.Email, optional: true },
  is_residential: { type: Boolean, optional: true },
  validate: { type: Boolean, optional: true },
  metadata: { type: String, optional: true }
});

// Overrides the properties required for purchasing labels/shipping.
// we don't override the purpose because for some cases like getRatesForCart we don't want to
// purchase Labels(purpose="QUOTE" but we want all the fields required for purchasing to be present.
export const purchaseAddressSchema = new SimpleSchema([addressSchema, {
  name: { type: String, optional: false },
  street1: { type: String, optional: false },
  city: { type: String, optional: false },
  state: { type: String, optional: false },
  zip: { type: String, optional: false },
  phone: { type: String, optional: false },
  email: { type: String, regEx: SimpleSchema.RegEx.Email, optional: true }
}]);

export const parcelSchema = new SimpleSchema({
  length: { type: Number, decimal: true, min: 0.0001 },
  width: { type: Number, decimal: true, min: 0.0001 },
  height: { type: Number, decimal: true, min: 0.0001 },
  distance_unit: { type: String, allowedValues: ["cm", "in", "ft", "mm", "m", "yd"] },
  weight: { type: Number, decimal: true, min: 0.0001 },
  mass_unit: { type: String, allowedValues: ["g", "oz", "lb", "kg"] },
  template: { type: String, optional: true },
  extra: { type: Object, optional: true },
  metadata: { type: String, optional: true }
});
