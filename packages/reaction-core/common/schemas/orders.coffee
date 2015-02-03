###
# Payments Schema
###
ReactionCore.Schemas.PaymentMethod = new SimpleSchema
  processor:
    type: String
  storedCard:
    type: String
    optional: true
  method:
    type: String
    optional: true
  transactionId:
    type: String
  status:
    type: String
    allowedValues: ["created", "approved", "failed", "canceled", "expired", "pending", "voided", "settled"]
  mode:
    type: String
    allowedValues: ["authorize", 'capture','refund','void']
  createdAt:
    type: Date
    optional: true
  updatedAt:
    type: Date
    optional :true
  authorization:
    type: String
    optional: true
  amount:
    type: Number
    decimal: true
  transactions:
    type: [Object]
    optional: true
    blackbox: true

ReactionCore.Schemas.Invoice = new SimpleSchema
  transaction:
    type: String
    optional: true
  shipping:
    type: Number
    decimal: true
    optional: true
  taxes:
    type: Number
    decimal: true
    optional: true
  subtotal:
    type: Number
    decimal: true
  discounts:
    type: Number
    decimal: true
    optional: true
  total:
    type: Number
    decimal: true


ReactionCore.Schemas.Payment = new SimpleSchema
  address:
    type: ReactionCore.Schemas.Address
    optional: true
  paymentMethod:
    type: [ReactionCore.Schemas.PaymentMethod]
    optional: true
  invoices:
    type: [ReactionCore.Schemas.Invoice]
    optional: true


###
# Orders
###
ReactionCore.Schemas.Document = new SimpleSchema
  docId:
    type: String
  docType:
    type: String
    optional: true

ReactionCore.Schemas.History = new SimpleSchema
    event:
      type: String
    userId:
      type: String
    updatedAt:
      type: Date

###
# ReactionCore.Schemas.OrderItems
# merges with ReactionCore.Schemas.Cart, ReactionCore.Schemas.OrderItems]
# to create Orders collection
###
ReactionCore.Schemas.OrderItems = new SimpleSchema
  additionalField:
    type: String
    optional: true
  status:
    type: String
  history:
    type: [ReactionCore.Schemas.History]
    optional: true
  documents:
    type: [ReactionCore.Schemas.Document]
    optional: true
