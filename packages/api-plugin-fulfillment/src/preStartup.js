import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import { MethodEmptyData } from "./simpleSchemas.js";

const logCtx = { name: "fulfillment", file: "preStartup" };

/**
 * @summary Extend the schema with updated allowedValues
 * @param {Object} context Startup context
 * @returns {undefined}
 */
async function extendSchemas(context) {
  const allFulfillmentTypesArray = context.allRegisteredFulfillmentTypes?.registeredFulfillmentTypes;

  if (!allFulfillmentTypesArray || allFulfillmentTypesArray.length === 0) {
    Logger.warn(logCtx, "No fulfillment types available");
    throw new ReactionError("invalid", "No fulfillment types available");
  }

  const {
    simpleSchemas: {
      // From product
      Product,
      // From Catalog
      CatalogProduct,
      // From Cart
      Shipment,
      CartItem,
      ShippingMethod,
      // From Order
      CommonOrder,
      OrderFulfillmentGroup,
      orderFulfillmentGroupInputSchema,
      SelectedFulfillmentOption
    }
  } = context;

  const schemaProductExtension = {
    "supportedFulfillmentTypes.$": {
      allowedValues: allFulfillmentTypesArray
    }
  };
  Product.extend(schemaProductExtension);

  const schemaCatalogProductExtension = {
    "supportedFulfillmentTypes.$": {
      allowedValues: allFulfillmentTypesArray
    }
  };
  CatalogProduct.extend(schemaCatalogProductExtension);

  const schemaShipmentExtension = {
    type: {
      allowedValues: allFulfillmentTypesArray
    }
  };
  Shipment.extend(schemaShipmentExtension);

  const schemaCartItemExtension = {
    "selectedFulfillmentType": {
      allowedValues: allFulfillmentTypesArray
    },
    "supportedFulfillmentTypes.$": {
      allowedValues: allFulfillmentTypesArray
    }
  };
  CartItem.extend(schemaCartItemExtension);

  const schemaExtension = {
    type: {
      allowedValues: allFulfillmentTypesArray
    }
  };
  const schemaExtensionCommonOrder = {
    fulfillmentType: {
      allowedValues: allFulfillmentTypesArray
    }
  };
  CommonOrder.extend(schemaExtensionCommonOrder);
  orderFulfillmentGroupInputSchema.extend(schemaExtension);
  OrderFulfillmentGroup.extend(schemaExtension);

  const schemaExtensionMethodAdditionalData = {
    methodAdditionalData: {
      type: SimpleSchema.oneOf(MethodEmptyData),
      // type: SimpleSchema.oneOf(MethodEmptyData, MethodFlatRateData, MethodUPSData, MethodStoreData),
      optional: true,
      label: "Method specific additional data"
    }
  };
  SelectedFulfillmentOption.extend(schemaExtensionMethodAdditionalData);
  ShippingMethod.extend(schemaExtensionMethodAdditionalData);
}

/**
 * @summary Called before startup to extend schemas
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentPreStartup(context) {
  await extendSchemas(context);
}
