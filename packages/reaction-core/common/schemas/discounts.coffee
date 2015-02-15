# Discount Types
ReactionCore.Schemas.DiscountType = new SimpleSchema
  percentage:
    type: Number
    optional: true
    label: "Percentage"
  fixed:
    type: Number
    optional: true
    label: "Price Discount"
  shipping:
    type: Boolean
    label: "Free Shipping"
    optional: true

# Discount Rules
ReactionCore.Schemas.DiscountRules = new SimpleSchema
  validUses:
    type: Number
    optional: true
  products:
    type: [String]
    optional: true
  codes:
    type: [String]
    optional: true
  range:
    type: [Object]
    optional: true
  'range.$.begin':
    type: Number
    optional: true
  'range.$.end':
    type: Number
    optional: true

# Discounts
ReactionCore.Schemas.Discounts = new SimpleSchema
  shopId:
    type: String
    autoValue: ReactionCore.shopIdAutoValue
  beginDate:
    type: Date
    optional: true
  endDate:
    type: Date
    optional: true
  discount:
    type: ReactionCore.Schemas.DiscountType
  rules:
    type: ReactionCore.Schemas.DiscountRules




