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

/**
 * @name FulfillmentMethodSchema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines Schema for Fulfillment Method
 * @property {Number} cost - optional cost
 * @property {String[]} fulfillmentTypes - fulfillment type retained for backward compatibility
 * @property {String} group - Group to which fulfillment method belong
 * @property {Number} handling - handling charges
 * @property {Boolean} enabled - status of fulfillment method
 * @property {String} label - displayed on the UI
 * @property {String} name - name of the fulfillment method, user editable
 * @property {String} fulfillmentMethod - used by application, not user editable
 * @property {String} displayMessageMethod - used to display additional message on UI specific to ff-method
 * @property {Number} rate - ratefor themethod
 */
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

/**
 * @name UserEditableFulfillmentMethodSchema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines Schema for User editable fields of Fulfillment Method
 * @property {Number} cost - optional cost
 * @property {Number} handling - handling charges
 * @property {Boolean} enabled - status of fulfillment method
 * @property {String} label - displayed on the UI
 * @property {String} displayMessageMethod - used to display additional message on UI specific to ff-method
 * @property {Number} rate - rate for the method
 */
export const UserEditableFulfillmentMethodSchema = new SimpleSchema({
  cost: {
    type: Number,
    optional: true
  },
  handling: {
    type: Number,
    optional: true
  },
  enabled: {
    type: Boolean,
    optional: true
  },
  label: {
    type: String,
    optional: true
  },
  displayMessageMethod: {
    type: String,
    optional: true
  },
  rate: {
    type: Number,
    optional: true
  }
});

/**
 * @name ProviderSchema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines Schema for Provider details inside Fulfillment Type
 * @property {Boolean} enabled - status of fulfillment method
 * @property {String} label - displayed on the UI
 * @property {String} name - name of the fulfillment type, user editable
 */
const ProviderSchema = new SimpleSchema({
  enabled: Boolean,
  label: String,
  name: String
});

/**
 * @name FulfillmentTypeSchema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Defines Schema for Fulfillment Type
 * @property {String} name - name of the fulfillment type, user editable
 * @property {String} shopId - Shop ID
 * @property {ProviderSchema} provider - Provider details
 * @property {String} fulfillmentType - fulfillmentType, not user editable
 * @property {String} displayMessageType - used to display additional message on UI specific to ff-type
 * @property {FulfillmentMethodSchema[]} methods - array of ff-methods under this ff-type
 * @property {Date} createdAt required
 * @property {Date} updatedAt required
 */
export const FulfillmentTypeSchema = new SimpleSchema({
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
  },
  "createdAt": {
    type: Date
  },
  "updatedAt": {
    type: Date
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
