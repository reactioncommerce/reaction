import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { SimpleInventoryCollectionSchema } from "../simpleSchemas.js";
import { updateFields, defaultValues } from "./defaults.js";

/**
 * @summary returns object with $set & $setOnInsert to be used in mongo update call. The values are validated with the collection schema before returning
 * @param {Object} input Input
 * @param {Object} input.productConfiguration Product configuration object
 * @param {String} input.shopId ID of shop that owns the product
 * @returns {Object} Object
 */
export default function getMongoUpdateModifier(input) {
  const { productConfiguration, shopId } = input;

  const $set = { updatedAt: new Date() };
  const $setOnInsert = {
    "_id": Random.id(),
    "createdAt": new Date(),
    // inventoryReserved is calculated by this plugin rather than being set by
    // users, but we need to init it to some number since this is required.
    // Below we update this to the correct number if we inserted.
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

  SimpleInventoryCollectionSchema.validate({
    $set,
    $setOnInsert: {
      ...$setOnInsert,
      "productConfiguration.productVariantId": productConfiguration.productVariantId,
      shopId
    }
  }, { modifier: true, upsert: true });

  return { $set, $setOnInsert };
}
