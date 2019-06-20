import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import Logger from "@reactioncommerce/logger";
import { ProductConfigurationSchema, SimpleInventoryCollectionSchema } from "../simpleSchemas";

const logCtx = { name: "core-inventory" };

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

// eslint-disable-next-line require-jsdoc
export default async function updateSimpleInventoryBulk(context, input) {
  const { appEvents, collections } = context;
  const { SimpleInventory } = collections;

  const bulkOperations = input.updates.map((update) => {
    const { productConfiguration, shopId } = update;
    inputSchema.validate(update); // try/catch
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
      const value = update[field];
      if (value !== undefined && value !== null) {
        $set[field] = value;
      } else {
        // If we are not setting the value here, then we add it to the setOnInsert.
        // This is necessary because all fields are required by the collection schema.
        $setOnInsert[field] = defaultValues[field];
      }
    });

    // if (Object.getOwnPropertyNames($set).length === 1) {
    //   throw new ReactionError("invalid-param", "You must provide at least one field to update.");
    // }

    const modifier = { $set, $setOnInsert };

    SimpleInventoryCollectionSchema.validate({
      $set,
      $setOnInsert: {
        ...$setOnInsert,
        "productConfiguration.productVariantId": productConfiguration.productVariantId,
        shopId
      }
    }, { modifier: true, upsert: true });

    return {
      updateOne: {
        filter: {
          "productConfiguration.productVariantId": productConfiguration.productVariantId,
          shopId
        },
        update: modifier,
        upsert: true
      }
    };
  });

  let res;
  try {
    res = await SimpleInventory.bulkWrite(bulkOperations, { ordered: false });
  } catch (error) {
    Logger.error({ ...logCtx, error });
    error.result.result.writeErrors.forEach((writeError) => {
      Logger.debug({
        ...logCtx,
        error,
        op: writeError.err.op,
        reason: writeError.err.errmsg
      });
    });
  }

  const upsertedIds = res.result.upserted.map((each) => each._id);

  // If we inserted, set the "reserved" quantity to what it should be. We could have
  // put this in the $setOnInsert but then we'd have to do the Orders lookup for
  // calculating reserved every time, even when only an update happens. It's better
  // to wait until here when we know whether we inserted.
  if (res.result.nUpserted > 0) {
    const upsertedDocsOpData = bulkOperations.filter((op) => upsertedIds.includes(op.updateOne.update.$setOnInsert._id));
    upsertedDocsOpData.forEach((operationData) => {
      const arg = {
        productConfiguration: {
          productId: operationData.updateOne.update.$setOnInsert["productConfiguration.productId"],
          productVariantId: operationData.updateOne.filter["productConfiguration.productVariantId"]
        },
        shopId: operationData.updateOne.filter.shopId
      };
      Logger.debug({ ...logCtx, arg }, "Calling recalculateReservedSimpleInventory");
      // for bulk version: do not await.
      context.mutations.recalculateReservedSimpleInventory(context, arg);
    });
  }

  if (res.result.nModified > 0) {
    const modifiedDocsOpData = bulkOperations.filter((op) => !upsertedIds.includes(op.updateOne.update.$setOnInsert._id));
    const productConfigurations = modifiedDocsOpData.map((operationData) => ({
      productId: operationData.updateOne.update.$setOnInsert["productConfiguration.productId"]
    }));
    Logger.debug({ ...logCtx, productConfigurations }, "Product configurations for afterBulkInventoryUpdate");
    appEvents.emit("afterBulkInventoryUpdate", { productConfigurations });
  }
}
