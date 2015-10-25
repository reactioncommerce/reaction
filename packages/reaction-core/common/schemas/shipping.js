/**
 * ShippingMethod Schema
 */

ReactionCore.Schemas.ShippingMethod = new SimpleSchema({
  "_id": {
    type: String,
    label: "Shipment Method Id",
    autoValue: ReactionCore.schemaIdAutoValue
  },
  "name": {
    type: String,
    label: "Method Name"
  },
  "label": {
    type: String,
    label: "Public Label"
  },
  "group": {
    type: String,
    label: "Group"
  },
  "cost": {
    type: Number,
    label: "Cost",
    decimal: true,
    optional: true
  },
  "handling": {
    type: Number,
    label: "Handling",
    optional: true,
    decimal: true,
    defaultValue: 0,
    min: 0
  },
  "rate": {
    type: Number,
    label: "Rate",
    decimal: true,
    min: 0
  },
  "enabled": {
    type: Boolean,
    label: "Enabled",
    defaultValue: true
  },
  "validRanges": {
    type: Array,
    optional: true,
    label: "Matching Cart Ranges"
  },
  "validRanges.$": {
    type: Object,
    optional: true
  },
  "validRanges.$.begin": {
    type: Number,
    decimal: true,
    label: "Begin",
    optional: true
  },
  "validRanges.$.end": {
    type: Number,
    decimal: true,
    label: "End",
    optional: true
  },
  "validLocales": {
    type: Array,
    optional: true,
    label: "Matching Locales"
  },
  "validLocales.$": {
    type: Object,
    optional: true
  },
  "validLocales.$.origination": {
    type: String,
    label: "From",
    optional: true
  },
  "validLocales.$.destination": {
    type: String,
    label: "To",
    optional: true
  },
  "validLocales.$.deliveryBegin": {
    type: Number,
    label: "Shipping Est.",
    optional: true
  },
  "validLocales.$.deliveryEnd": {
    type: Number,
    label: "Delivery Est.",
    optional: true
  }
});

/**
 * ShipmentQuote Schema
 */

ReactionCore.Schemas.ShipmentQuote = new SimpleSchema({
  carrier: {
    type: String
  },
  method: {
    type: ReactionCore.Schemas.ShippingMethod
  },
  rate: {
    type: Number,
    decimal: true,
    defaultValue: "0.00"
  }
});

// populate with order.items that are added to a shipment
ReactionCore.Schemas.ShipmentItem = new SimpleSchema({
  _id: {
    type: String,
    label: "Shipment Line Item",
    optional: true,
    autoValue: ReactionCore.schemaIdAutoValue
  },
  productId: {
    type: String,
    index: 1
  },
  shopId: {
    type: String,
    index: 1,
    label: "Shipment Item ShopId",
    optional: true
  },
  quantity: {
    label: "Quantity",
    type: Number,
    min: 0
  },
  variantId: {
    type: String
  }
});

/**
 * ShippingParcel Schema
 */

ReactionCore.Schemas.ShippingParcel = new SimpleSchema({
  containers: {
    type: String,
    optional: true
  },
  length: {
    type: Number,
    optional: true
  },
  width: {
    type: Number,
    optional: true
  },
  height: {
    type: Number,
    optional: true
  },
  weight: {
    type: Number,
    optional: true
  }
});

/**
 * Shipment Schema
 * used for cart/order shipment tracking
 */

ReactionCore.Schemas.Shipment = new SimpleSchema({
  _id: {
    type: String,
    label: "Shipment Id",
    autoValue: ReactionCore.schemaIdAutoValue
  },
  paymentId: {
    type: String,
    label: "Payment Id",
    optional: true
  },
  address: {
    type: ReactionCore.Schemas.Address,
    optional: true
  },
  shipmentMethod: {
    type: ReactionCore.Schemas.ShippingMethod,
    optional: true
  },
  shipmentQuotes: {
    type: [ReactionCore.Schemas.ShipmentQuote],
    optional: true
  },
  tracking: {
    type: String,
    optional: true
  },
  parcel: {
    type: ReactionCore.Schemas.ShippingParcel,
    optional: true
  },
  items: {
    type: [ReactionCore.Schemas.ShipmentItem],
    optional: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  },
  packed: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  shipped: {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  invoice: {
    type: ReactionCore.Schemas.Invoice,
    optional: true
  },
  transactions: {
    type: [Object],
    optional: true,
    blackbox: true
  }
});

/**
 * ShippingProvider Schema
 */

ReactionCore.Schemas.ShippingProvider = new SimpleSchema({
  name: {
    type: String,
    label: "Service Code"
  },
  label: {
    type: String,
    label: "Public Label"
  },
  enabled: {
    type: Boolean,
    defaultValue: true
  },
  serviceAuth: {
    type: String,
    label: "Auth",
    optional: true
  },
  serviceSecret: {
    type: String,
    label: "Secret",
    optional: true
  },
  serviceUrl: {
    type: String,
    label: "Service URL",
    optional: true
  }
});

/**
 * Shipping Schema
 */

ReactionCore.Schemas.Shipping = new SimpleSchema({
  shopId: {
    type: String,
    index: 1,
    autoValue: ReactionCore.shopIdAutoValue,
    label: "Shipping ShopId"
  },
  provider: {
    type: ReactionCore.Schemas.ShippingProvider,
    label: "Shipping Provider"
  },
  methods: {
    type: [ReactionCore.Schemas.ShippingMethod],
    optional: true,
    label: "Shipping Methods"
  },
  shipmentQuotes: {
    type: [ReactionCore.Schemas.ShipmentQuote],
    optional: true,
    label: "Quoted Methods"
  }
});
