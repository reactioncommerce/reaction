ReactionCore.Schemas.Shipping = new SimpleSchema
  shopId:
    type: String
  provider:
    type: ReactionCore.Schemas.ShippingProvider
  methods:
    type: [ReactionCore.Schemas.ShippingMethod]

ReactionCore.Schemas.ShipmentQuote = new SimpleSchema
  carrier:
    type: Number
  method:
    type: Number
  tracking:
    type: String
    optional: true
  label:
    type: String
    optional: true
  value:
    type: String
    optional: true

ReactionCore.Schemas.Shipment = new SimpleSchema
  address:
    type: ReactionCore.Schemas.Address
    optional: true
  shipmentMethod:
    type: ReactionCore.Schemas.ShipmentQuote
    optional: true


ReactionCore.Schemas.ShippingProvider = new SimpleSchema
  name:
    type: String
    label: "Name",
    regEx: /^\w+\s\w+$/
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
  containers:
    type: [Object]
    blackbox: true

ReactionCore.Schemas.ShippingMethod = new SimpleSchema
  name:
    type: String
    label: "Name"
  label:
    type: String
    label: "Label"
  group:
    type: String
    label: "Group"
  cost:
    type: Number
    label: "Cost"
    optional: true
  handling:
    type: Number
    label: "Handling"
    defaultValue: 0
    optional: true
  rate:
    type: Number
    label: "Rate"
    defaultValue: 0
    optional: true
  enabled:
    type: Boolean
    label: "Enabled"
    defaultValue: true
  validRanges:
    type: Array
    optional: true
    label: "Valid Cart SubTotal Range"
  'validRanges.$':
    type: Object
    optional: true
  'validRanges.$.begin':
    type: Number
    label: "Begin"
    optional: true
  'validRanges.$.end':
    type: Number
    label: "End"
    optional: true
  # validDestinations:
  #   type: [Object]
  #   blackbox: true
  #   optional: true
  #   label: "Valid destinations"
  # validOrigination:
  #   type: [Object]
  #   blackbox: true
  #   optional: true
  #   label: "Valid originations"
