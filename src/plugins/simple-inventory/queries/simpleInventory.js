import SimpleSchema from "simpl-schema";
import { ProductConfigurationSchema } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  productConfiguration: ProductConfigurationSchema,
  shopId: String
});

/**
 * @name simpleInventory
 * @summary Gets SimpleInventory data for a product configuration
 * @param {Object} context App context
 * @param {Object} input Input
 * @param {Object} input.productConfiguration Product configuration object
 * @param {String} input.shopId Shop ID
 * @returns {Object|null} SimpleInventory info
 */
export default async function simpleInventory(context, input) {
  inputSchema.validate(input);

  const { productConfiguration, shopId } = input;
  const { collections } = context;
  const { SimpleInventory } = collections;

  await context.validatePermissions(
    `reaction:legacy:inventory:${productConfiguration.productVariantId}`,
    "read",
    { shopId }
  );

  return SimpleInventory.findOne({
    "productConfiguration.productVariantId": productConfiguration.productVariantId,
    // Must include shopId here or the security check above is worthless
    shopId
  });
}
