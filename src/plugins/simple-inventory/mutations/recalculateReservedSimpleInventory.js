import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { ProductConfigurationSchema, SimpleInventoryCollectionSchema } from "../simpleSchemas.js";
import getReservedQuantity from "../utils/getReservedQuantity.js";

const inputSchema = new SimpleSchema({
  productConfiguration: ProductConfigurationSchema,
  shopId: String
});

/**
 * @summary Force recalculation of the system-managed `inventoryReserved` field based on current order statuses.
 * @param {Object} context App context
 * @param {Object} input Input
 * @param {Object} input.productConfiguration Product configuration object
 * @param {String} input.shopId ID of shop that owns the product
 * @param {Boolean} input.canBackorder Whether to allow ordering this product configuration when there is insufficient quantity available
 * @param {Number} input.inventoryInStock Current quantity of this product configuration in stock
 * @param {Boolean} input.isEnabled Whether the SimpleInventory plugin should manage inventory for this product configuration
 * @param {Number} input.lowInventoryWarningThreshold The "low quantity" flag will be applied to this product configuration
 *   when the available quantity is at or below this threshold.
 * @returns {Object} Updated inventory values
 */
export default async function recalculateReservedSimpleInventory(context, input) {
  inputSchema.validate(input);

  const { appEvents, collections, isInternalCall, userHasPermission, userId } = context;
  const { Products, SimpleInventory } = collections;
  const { productConfiguration, shopId } = input;

  if (!isInternalCall) {
    // Verify that the product exists. For internal calls, we assume we can skip this
    // verification because it saves a database command and maybe we are storing inventories
    // before product is created due to some syncing process.
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
    if (!userHasPermission(["admin"], shopId)) {
      throw new ReactionError("access-denied", "Access denied");
    }
  }

  const inventoryReserved = await getReservedQuantity(context, productConfiguration);

  const modifier = {
    $set: {
      inventoryReserved,
      updatedAt: new Date()
    }
  };

  SimpleInventoryCollectionSchema.validate(modifier, { modifier: true });

  const { value: updatedDoc } = await SimpleInventory.findOneAndUpdate(
    {
      "productConfiguration.productVariantId": productConfiguration.productVariantId,
      shopId
    },
    modifier,
    {
      returnOriginal: false
    }
  );

  if (!updatedDoc) throw new ReactionError("not-tracked", "Inventory not tracked for this product");

  await appEvents.emit("afterInventoryUpdate", { productConfiguration, updatedBy: userId });

  return updatedDoc;
}
