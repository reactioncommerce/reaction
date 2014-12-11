ReactionCore.Schemas.Shipping = new SimpleSchema
  shopId:
    type: String
    index: 1
    autoValue: ->
      if this.isInsert
        return ReactionCore.getShopId() or "1" if Meteor.isClient
        # force the correct value upon insert
        return ReactionCore.getShopId()
      else
        # don't allow updates
        this.unset();
  provider:
    type: ReactionCore.Schemas.ShippingProvider
  methods:
    type: [ReactionCore.Schemas.ShippingMethod]
    optional: true

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
    label: "Service Name"
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

ReactionCore.Schemas.ShippingContainers = new SimpleSchema
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
  deliveryRange:
    type: Array
    optional: true
    label: "Estimated Delivery"
  'deliveryRange.$':
    type: Object
    optional: true
  'deliveryRange.$.begin':
    type: Number
    label: "Will ship in"
  'deliveryRange.$.end':
    type: Number
    label: "Will arrive in"
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
  validDestinations:
    type: [Object]
    blackbox: true
    optional: true
    label: "Valid destinations"
  validOrigination:
    type: [Object]
    blackbox: true
    optional: true
    label: "Valid originations"
