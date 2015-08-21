###
# Carts
###
ReactionCore.Schemas.CartItem = new SimpleSchema
  _id:
    type: String
  productId:
    type: String
    index: 1
  shopId:
    type: String
    autoValue: ReactionCore.shopIdAutoValue
    index: 1
  quantity:
    label: "Quantity"
    type: Number
    min: 0
  variants:
    type: ReactionCore.Schemas.ProductVariant

ReactionCore.Schemas.Cart = new SimpleSchema
  shopId:
    type: String
    autoValue: ReactionCore.shopIdAutoValue
    index: 1
  userId:
    type: String
    optional: true
    index: 1
  sessions:
    type: [String]
    optional: true
    index: 1
  email:
    type: String
    optional: true
    index: 1
    regEx: SimpleSchema.RegEx.Email
  items:
    type: [ReactionCore.Schemas.CartItem]
    optional: true
  requiresShipping:
    label: "Require a shipping address"
    type: Boolean
    defaultValue: true
    optional: true
  shipping:
    type: ReactionCore.Schemas.Shipment
    optional: true
    blackbox: true
  payment:
    type: ReactionCore.Schemas.Payment
    optional: true
    blackbox: true
  totalPrice:
    label: "Total Price"
    type: Number
    optional: true
    decimal: true
    min: 0
  status:
    type: String
    defaultValue: "checkoutLogin"
    optional: true
  createdAt:
    type: Date
    autoValue: ->
      if @isInsert
        return new Date
      else if @isUpsert
        return $setOnInsert: new Date
    denyUpdate: true
  updatedAt:
    type: Date
    autoValue: ->
      if @isUpdate
        return $set: new Date
      else if @isUpsert
        return $setOnInsert: new Date
    optional: true
