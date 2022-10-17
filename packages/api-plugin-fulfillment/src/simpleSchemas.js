import SimpleSchema from "simpl-schema";

/**
 * @name MethodEmptyData
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines Empty placeholder
 * @property {String} gqlType Defines the method type
 * @property {Boolean} emptyData Empty Data fields
 */
export const MethodEmptyData = new SimpleSchema({
  gqlType: String,
  emptyData: {
    type: Boolean,
    optional: true
  }
});


export const FulfillmentMethodSchema = new SimpleSchema({
  "cost": {
    type: Number,
    optional: true
  },
  "fulfillmentTypes": {
    type: Array,
    minCount: 1
  },
  "fulfillmentTypes.$": String,
  "group": String,
  "handling": Number,
  "enabled": Boolean,
  "label": String,
  "name": String,
  "fulfillmentMethod": {
    type: String,
    optional: true
  },
  "displayMessageMethod": {
    type: String,
    optional: true
  },
  "rate": Number
});

const ProviderSchema = new SimpleSchema({
  enabled: Boolean,
  label: String,
  name: String
});

export const fulfillmentTypeSchema = new SimpleSchema({
  "name": String,
  "shopId": String,
  "provider": {
    type: ProviderSchema
  },
  "fulfillmentType": String,
  "displayMessageType": {
    type: String,
    optional: true
  },
  "methods": {
    type: Array,
    optional: true
  },
  "methods.$": {
    type: FulfillmentMethodSchema
  }
});

/**
 * @summary Extend the schema with updated allowedValues
 * @param {Object} schemas Schemas from context passed in
 * @param {String[]} allFulfillmentTypesArray Array of all fulfillment types
 * @returns {undefined}
 */
export function extendFulfillmentSchemas(schemas, allFulfillmentTypesArray) {
  const schemaProductExtension = {
    "supportedFulfillmentTypes.$": {
      allowedValues: allFulfillmentTypesArray
    }
  };
  schemas.Product.extend(schemaProductExtension);

  const schemaCatalogProductExtension = {
    "supportedFulfillmentTypes.$": {
      allowedValues: allFulfillmentTypesArray
    }
  };
  schemas.CatalogProduct.extend(schemaCatalogProductExtension);

  const schemaShipmentExtension = {
    type: {
      allowedValues: allFulfillmentTypesArray
    }
  };
  schemas.Shipment.extend(schemaShipmentExtension);

  const schemaCartItemExtension = {
    "selectedFulfillmentType": {
      allowedValues: allFulfillmentTypesArray
    },
    "supportedFulfillmentTypes.$": {
      allowedValues: allFulfillmentTypesArray
    }
  };
  schemas.CartItem.extend(schemaCartItemExtension);

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
  schemas.CommonOrder.extend(schemaExtensionCommonOrder);
  schemas.orderFulfillmentGroupInputSchema.extend(schemaExtension);
  schemas.OrderFulfillmentGroup.extend(schemaExtension);

  const schemaExtensionMethodAdditionalData = {
    methodAdditionalData: {
      type: SimpleSchema.oneOf(MethodEmptyData),
      optional: true,
      label: "Method specific additional data"
    }
  };
  schemas.SelectedFulfillmentOption.extend(schemaExtensionMethodAdditionalData);
  schemas.ShippingMethod.extend(schemaExtensionMethodAdditionalData);
}
