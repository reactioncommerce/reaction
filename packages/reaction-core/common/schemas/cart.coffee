###
# Carts
###
ReactionCore.Schemas.CartItem = new SimpleSchema
  _id:
    type: String
  productId:
    type: String
  quantity:
    label: "Quantity"
    type: Number
    min: 0
  variants:
    type: ReactionCore.Schemas.ProductVariant

ReactionCore.Schemas.Cart = new SimpleSchema
  shopId:
    type: String
    index: 1
    autoValue: ReactionCore.shopIdAutoValue
  sessionId:
    type: String
    optional: true
    custom: -> #required if userId isn't set
      userIdField = @siblingField "userId"
      return "required" if @isInsert and !@value and !userIdField.value
      #TODO: This update logic as is would not be correct because we also need to
      #look up the existing doc and see if userId is already set, in which case
      #it's OK to unset sessionId. Collection2 should provide the doc _id so
      #that we can do this lookup.
      #return "required" if @isUpdate and (@operator is "$unset" or @value is null) and !userIdField.value
    index: 1
  userId:
    type: String
    optional: true
    index: 1
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
  state:
    type: String
    defaultValue: "new"
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
