ReactionCore.Schemas.Shipping = new SimpleSchema
  shopId:
    type: String
    index: 1
    autoValue: ReactionCore.shopIdAutoValue
  provider:
    type: ReactionCore.Schemas.ShippingProvider
  methods:
    type: [ReactionCore.Schemas.ShippingMethod]
    optional: true

ReactionCore.Schemas.ShipmentQuote = new SimpleSchema
  carrier:
    type: String
  method:
    type: ReactionCore.Schemas.ShippingMethod
  rate:
    type: Number
    decimal: true
    defaultValue: "0.00"
  tracking:
    type: String
    optional: true

ReactionCore.Schemas.Shipment = new SimpleSchema
  address:
    type: ReactionCore.Schemas.Address
    label: "Destination"
    optional: true
  shipmentMethod:
    type: ReactionCore.Schemas.ShipmentQuote
    label:"Selected Rate"
    optional: true
  shipmentQuotes:
    type: [ReactionCore.Schemas.ShipmentQuote]
    label: "Rate Quotes"
    optional: true


ReactionCore.Schemas.ShippingProvider = new SimpleSchema
  name:
    type: String
    label: "Service Code"
  label:
    type: String
    label: "Public Label"
  enabled:
    type: Boolean
    defaultValue: true
  serviceAuth:
    type: String
    label: "Auth"
    optional: true
  serviceSecret:
    type: String
    label: "Secret"
    optional: true
  serviceUrl:
    type: String
    label: "Service URL"
    optional: true

ReactionCore.Schemas.ShippingParcel = new SimpleSchema
  containers:
    type: String
    optional: true
  length:
    type: Number
    optional: true
  width:
    type: Number
    optional: true
  height:
    type: Number
    optional: true
  weight:
    type: Number
    optional: true


ReactionCore.Schemas.ShippingMethod = new SimpleSchema
  name:
    type: String
    label: "Method Code"
  label:
    type: String
    label: "Public Label"
  group:
    type: String
    label: "Group"
  cost:
    type: Number
    label: "Cost"
    decimal: true
    optional: true
  handling:
    type: Number
    label: "Handling"
    optional: true
    decimal: true
    defaultValue: 0
    min: 0
  rate:
    type: Number
    label: "Rate"
    decimal: true
    min: 0
  enabled:
    type: Boolean
    label: "Enabled"
    defaultValue: true
  validRanges:
    type: Array
    optional: true
    label: "Matching Cart Ranges"
  'validRanges.$':
    type: Object
    optional: true
  'validRanges.$.begin':
    type: Number
    decimal: true
    label: "Begin"
    optional: true
  'validRanges.$.end':
    type: Number
    decimal: true
    label: "End"
    optional: true
  validLocales:
    type: Array
    optional: true
    label: "Matching Locales"
  'validLocales.$':
    type: Object
    optional: true
  'validLocales.$.origination':
    type: String
    label: "From"
    optional: true
  'validLocales.$.destination':
    type: String
    label: "To"
    optional: true
  'validLocales.$.deliveryBegin':
    type: Number
    label: "Shipping Est."
    optional: true
  'validLocales.$.deliveryEnd':
    type: Number
    label: "Delivery Est."
    optional: true
