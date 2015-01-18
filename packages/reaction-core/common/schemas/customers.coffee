###
# Customers
###
ReactionCore.Schemas.Customer = new SimpleSchema
  shopId:
    type: String
  email:
    type: String
  fullName:
    type: String
  imageUrl:
    type: String
  acceptsMarketing:
    type: Boolean
  ordersCount:
    type: Number
  totalSpent:
    type: Number
    decimal: true
  state:
    type: String
  lastOrderId:
    type: String
    optional: true
  lastOrderName:
    type: String
    optional: true
  note:
    type: String
    optional: true
  hashtags:
    type: [String]
    optional: true
  multipassIdentifier:
    type: String
    optional: true
  verifiedEmail:
    type: Boolean
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true
  createdAt:
    type: Date
  updatedAt:
    type: Date