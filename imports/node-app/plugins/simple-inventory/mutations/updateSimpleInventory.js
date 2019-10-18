import ReactionError from "@reactioncommerce/reaction-error";
import { inputSchema } from "../utils/defaults.js";
import getModifier from "../utils/getMongoUpdateModifier.js";

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
 * @param {Object} [options] Other options
 * @param {Boolean} [options.returnUpdatedDoc=true] Set to `false` as a performance optimization
 *   if you don't need the updated document returned.
 * @returns {Object|null} Updated inventory values, or `null` if `returnUpdatedDoc` is `false`
 */
export default async function updateSimpleInventory(context, input, options = {}) {
  inputSchema.validate(input);

  const { appEvents, collections, isInternalCall, userHasPermission, userId } = context;
  const { Products, SimpleInventory } = collections;
  const { productConfiguration, shopId } = input;
  const { returnUpdatedDoc = true } = options;

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

  const modifier = getModifier(input);
  const { upsertedCount } = await SimpleInventory.updateOne(
    {
      "productConfiguration.productVariantId": productConfiguration.productVariantId,
      shopId
    },
    modifier,
    {
      upsert: true
    }
  );

  // If we inserted, set the "reserved" quantity to what it should be. We could have
  // put this in the $setOnInsert but then we'd have to do the Orders lookup for
  // calculating reserved every time, even when only an update happens. It's better
  // to wait until here when we know whether we inserted.
  if (upsertedCount === 1) {
    await context.mutations.recalculateReservedSimpleInventory(context, {
      productConfiguration,
      shopId
    });
  } else {
    // Only emit event if not upserting, as `recalculateReservedSimpleInventory` already emits it.
    await appEvents.emit("afterInventoryUpdate", { productConfiguration, updatedBy: userId });
  }

  let updatedDoc = null;
  if (returnUpdatedDoc) {
    updatedDoc = await SimpleInventory.findOne({
      "productConfiguration.productVariantId": productConfiguration.productVariantId,
      shopId
    });
  }

  return updatedDoc;
}
