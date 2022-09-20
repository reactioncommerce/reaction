import SimpleSchema from "simpl-schema";
import { ProductConfigurationSchema } from "../simpleSchemas.js";

export const inputSchema = new SimpleSchema({
  productConfiguration: ProductConfigurationSchema,
  canBackorder: {
    type: Boolean,
    optional: true
  },
  inventoryInStock: {
    type: SimpleSchema.Integer,
    min: 0,
    optional: true
  },
  isEnabled: {
    type: Boolean,
    optional: true
  },
  lowInventoryWarningThreshold: {
    type: SimpleSchema.Integer,
    min: 0,
    optional: true
  },
  shopId: String
});

export const updateFields = [
  "canBackorder",
  "inventoryInStock",
  "isEnabled",
  "lowInventoryWarningThreshold"
];

export const defaultValues = {
  canBackorder: false,
  inventoryInStock: 0,
  isEnabled: false,
  lowInventoryWarningThreshold: 0
};
