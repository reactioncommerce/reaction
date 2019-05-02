import SimpleSchema from "simpl-schema";

export const ProductConfigurationSchema = new SimpleSchema({
  productId: String,
  productVariantId: String
});

export const SimpleInventoryCollectionSchema = new SimpleSchema({
  productConfiguration: ProductConfigurationSchema,
  canBackorder: Boolean,
  createdAt: Date,
  inventoryInStock: {
    type: SimpleSchema.Integer,
    min: 0
  },
  isEnabled: Boolean,
  lowInventoryWarningThreshold: {
    type: SimpleSchema.Integer,
    min: 0
  },
  inventoryReserved: {
    type: SimpleSchema.Integer,
    min: 0
  },
  updatedAt: Date
});
