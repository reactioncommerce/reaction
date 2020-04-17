import SimpleSchema from "simpl-schema";

export const ProductConfigurationSchema = new SimpleSchema({
  productId: String,
  productVariantId: String
});

export const SimpleInventoryCollectionSchema = new SimpleSchema({
  _id: String,
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
  productConfiguration: ProductConfigurationSchema,
  shopId: String,
  updatedAt: Date
});
