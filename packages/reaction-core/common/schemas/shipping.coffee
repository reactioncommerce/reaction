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
  deliveryRange:
    type: Object
    optional: true
    label: "Estimated Delivery"
  'deliveryRange.begin':
    type: Number
    label: "Days to ship"
  'deliveryRange.end':
    type: Number
    label: "Days until delivery"
  validRanges:
    type: Array
    optional: true
    label: "Matching Cart Ranges"
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
  validLocale:
    type: Array
    optional: true
    label: "Matching Locales"
  'validLocale.$':
    type: Object
    optional: true
  'validLocale.$.origination':
    type: String
    label: "From"
    optional: true
  'validLocale.$.destination':
    type: String
    label: "To"
    optional: true
