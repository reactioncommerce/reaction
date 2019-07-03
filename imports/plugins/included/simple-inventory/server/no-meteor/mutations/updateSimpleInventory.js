import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
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
 * @param {Object} [options] Other options
 * @param {Boolean} [options.returnUpdatedDoc=true] Set to `false` as a performance optimization
 *   if you don't need the updated document returned.
 * @return {Object|null} Updated inventory values, or `null` if `returnUpdatedDoc` is `false`
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

  const modifier = { $set, $setOnInsert };

  SimpleInventoryCollectionSchema.validate({
    $set,
    $setOnInsert: {
      ...$setOnInsert,
      "productConfiguration.productVariantId": productConfiguration.productVariantId,
      shopId
    }
  }, { modifier: true, upsert: true });

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
