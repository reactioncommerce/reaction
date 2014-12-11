# XXX Unused?
ReactionCore.Schemas.Social = new SimpleSchema
  service:
    type: String
  handle:
    type: String

###
# Products
###
ReactionCore.Schemas.VariantMedia = new SimpleSchema
  mediaId:
    type: String
    optional: true
  priority:
    type: Number
    optional: true
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true
  updatedAt:
    type: Date
    optional: true
  createdAt:
    type: Date

ReactionCore.Schemas.ProductPosition = new SimpleSchema
  tag:
    type: String
    optional: true
  position:
    type: Number
    optional: true
  weight:
    type: String
    optional: true
  updatedAt:
    type: Date

ReactionCore.Schemas.ProductVariant = new SimpleSchema
  _id:
    type: String
  parentId:
    type: String
    optional: true
  cloneId:
    type: String
    optional: true
  index:
    type: String
    optional: true
  barcode:
    label: "Barcode"
    type: String
    optional: true
  compareAtPrice:
    label: "MSRP"
    type: Number
    optional: true
    decimal: true
    min: 0
  fulfillmentService:
    label: "Fulfillment service"
    type: String
    optional: true
  weight:
    label: "Weight"
    type: Number
    min: 0
  inventoryManagement:
    type: Boolean
    label: "Inventory Tracking"
  inventoryPolicy:
    type: Boolean
    label: "Deny when out of stock"
  lowInventoryWarningThreshold:
    type: Number
    label: "Warn @"
    min: 0
    optional: true
  inventoryQuantity:
    type: Number
    label: "Quantity"
    optional: true
    custom: ->
      if Meteor.isClient
        if checkChildVariants(@.docId) is 0 and !@.value then return "required"
  price:
    label: "Price"
    type: Number
    decimal: true
    min: 0
    optional: true
    custom: -> #required if no child variants (options) present
      if Meteor.isClient
        if checkChildVariants(@.docId) is 0 and !@.value then return "required"

  requiresShipping:
    label: "Require a shipping address"
    type: Boolean
    optional: true
  sku:
    label: "SKU"
    type: String
    optional: true
  taxable:
    label: "Taxable"
    type: Boolean
    optional: true
  title:
    label: "Label"
    type: String
  optionTitle:
    label: "Option"
    type: String
    optional: true
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true
  positions:
    type: [ReactionCore.Schemas.ProductPosition]
    optional: true
  createdAt:
    label: "Created at"
    type: Date
    optional: true
  updatedAt:
    label: "Updated at"
    type: Date
    optional: true

ReactionCore.Schemas.Product = new SimpleSchema
  _id:
    type: String
    optional: true
  cloneId:
    type: String
    optional: true
  shopId:
    type: String
  title:
    type: String
  pageTitle:
    type: String
    optional: true
  description:
    type: String
    optional: true
  productType:
    type: String
  vendor:
    type: String
    optional: true
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true
  variants:
    type: [ReactionCore.Schemas.ProductVariant]
  hashtags:
    type: [String]
    optional: true
    index: 1
  twitterMsg:
    type: String
    optional: true
    max: 140
  facebookMsg:
    type: String
    optional: true
    max: 255
  instagramMsg:
    type: String
    optional: true
    max: 255
  pinterestMsg:
    type: String
    optional: true
    max: 255
  metaDescription:
    type: String
    optional: true
  handle:
    type: String
    optional: true
    index: 1
  isVisible:
    type: Boolean
    index: 1
  publishedAt:
    type: Date
    optional: true
  publishedScope:
    type: String
    optional: true
  templateSuffix:
    type: String
    optional: true
  createdAt:
    type: Date
  updatedAt:
    type: Date
    autoValue : ->
      new Date() if @isUpdate
    optional: true