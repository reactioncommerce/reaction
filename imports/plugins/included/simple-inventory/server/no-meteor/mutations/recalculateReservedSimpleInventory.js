import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { ProductConfigurationSchema, SimpleInventoryCollectionSchema } from "../simpleSchemas";

const inputSchema = new SimpleSchema({
  productConfiguration: ProductConfigurationSchema,
  shopId: String
});

/**
 *
 * @method getReservedQuantity
 * @summary Get the number of product variants that are currently reserved in an order.
 * This function can take any variant object.
 * @param {Object} context App context
 * @param {Object} productConfiguration Product configuration
 * @return {Promise<Number>} Reserved variant quantity
 */
async function getReservedQuantity(context, productConfiguration) {
  const { productVariantId } = productConfiguration;

  // Find orders that are new or processing
  const orders = await context.collections.Orders.find({
    "workflow.status": { $in: ["new", "coreOrderWorkflow/processing"] },
    "shipping.items.variantId": productVariantId
  }).toArray();

  const reservedQuantity = orders.reduce((sum, order) => {
    // Reduce through each fulfillment (shipping) object
    const shippingGroupsItems = order.shipping.reduce((acc, shippingGroup) => {
      // Get all items in order that match the item being adjusted
      const matchingItems = shippingGroup.items.filter((item) => item.variantId === productVariantId);

      // Reduce `quantity` fields of matched items into single number
      const reservedQuantityOfItem = matchingItems.reduce((quantity, matchingItem) => quantity + matchingItem.quantity, 0);

      return acc + reservedQuantityOfItem;
    }, 0);

    // Sum up numbers from all fulfillment (shipping) groups
    return sum + shippingGroupsItems;
  }, 0);

  return reservedQuantity;
}

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
 * @return {Object} Updated inventory values
 */
export default async function recalculateReservedSimpleInventory(context, input) {
  inputSchema.validate(input);

  const { appEvents, collections, isInternalCall, userHasPermission, userId } = context;
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

  appEvents.emit("afterInventoryUpdate", { productConfiguration, updatedBy: userId });

  return updatedDoc;
}
