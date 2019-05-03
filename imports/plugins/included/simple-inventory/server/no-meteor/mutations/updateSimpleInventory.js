import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { ProductConfigurationSchema, SimpleInventoryCollectionSchema } from "../simpleSchemas";

const inputSchema = new SimpleSchema({
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

const updateFields = [
  "canBackorder",
  "inventoryInStock",
  "isEnabled",
  "lowInventoryWarningThreshold"
];

const defaultValues = {
  canBackorder: false,
  inventoryInStock: 0,
  isEnabled: false,
  lowInventoryWarningThreshold: 0
};

/**
 * @summary Updates SimpleInventory data for a product configuration. Pass only
 *   those arguments you want to update.
 * @param {Object} context App context
 * @param {Object} input Input
 * @param {Object} input.productConfiguration Product configuration object
 * @param {String} input.shopId ID of shop that owns the product
 * @param {Boolean} input.canBackorder Whether to allow ordering this product configuration when there is insufficient quantity available
 * @param {Number} input.inventoryInStock Current quantity of this product configuration in stock
 * @param {Boolean} input.isEnabled Whether the SimpleInventory plugin should manage inventory for this product configuration
 * @param {Number} input.lowInventoryWarningThreshold The "low quantity" flag will be applied to this product configuration
 *   when the available quantity is at or below this threshold.
 * @return {Object} Updated inventory values
 */
export default async function updateSimpleInventory(context, input) {
  inputSchema.validate(input);

  const { collections, isInternalCall, userHasPermission } = context;
  const { Products, SimpleInventory } = collections;
  const { productConfiguration, shopId } = input;

  // Verify that the product exists
  const foundProduct = await Products.findOne({
    _id: productConfiguration.productId,
    shopId
  }, {
    projection: {
      shopId: 1
    }
  });
  if (!foundProduct) throw new ReactionError("not-found", "Product not found");

  // Allow update if the account has "admin" permission. When called internally by another
  // plugin, context.isInternalCall can be set to `true` to disable this check.
  if (!isInternalCall && !userHasPermission(["admin"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  const $set = { updatedAt: new Date() };
  const $setOnInsert = {
    "createdAt": new Date(),
    // inventoryReserved is calculated by this plugin rather than being set by
    // users, but we need to init it to 0 on inserts since it's required.
    "inventoryReserved": 0,
    // The upsert query below has only `productVariantId` so we need to ensure both are inserted
    "productConfiguration.productId": productConfiguration.productId
  };
  updateFields.forEach((field) => {
    const value = input[field];
    if (value !== undefined && value !== null) {
      $set[field] = value;
    } else {
      // If we are not setting the value here, then we add it to the setOnInsert.
      // This is necessary because all fields are required by the collection schema.
      $setOnInsert[field] = defaultValues[field];
    }
  });

  if (Object.getOwnPropertyNames($set).length === 1) {
    throw new ReactionError("invalid-param", "You must provide at least one field to update.");
  }

  const modifier = { $set, $setOnInsert };

  SimpleInventoryCollectionSchema.validate({
    $set,
    $setOnInsert: {
      ...$setOnInsert,
      "productConfiguration.productVariantId": productConfiguration.productVariantId,
      shopId
    }
  }, { modifier: true, upsert: true });

  const { value: updatedDoc } = await SimpleInventory.findOneAndUpdate(
    {
      "productConfiguration.productVariantId": productConfiguration.productVariantId,
      shopId
    },
    modifier,
    {
      returnOriginal: false,
      upsert: true
    }
  );

  return updatedDoc;
}
