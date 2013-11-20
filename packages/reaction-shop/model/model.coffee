ProductVariantSchema = new SimpleSchema
  barcode:
    label: "Barcode"
    type: String
    optional: true
  compareAtPrice:
    label: "Compare at price"
    type: Number
    optional: true
    decimal: true
    min: 0
  fulfillmentService:
    label: "Fulfillment service"
    type: String
    optional: true
  grams:
    label: "Weight"
    type: Number
    optional: true
    min: 0
  inventoryManagement:
    label: "Inventory policy" # really so
    type: String
    allowedValues: ["manual", "reaction"]
  inventoryPolicy:
    label: "Allow users to purchase this item, even if it is no longer in stock"
    type: String
    allowedValues: ["deny", "continue"]
  inventoryQuantity:
    label: "Quantity"
    type: Number
    optional: true
    min: 0
  price:
    label: "Price"
    type: Number
    decimal: true
    min: 0
  requiresShipping:
    label: "Require a shipping address"
    type: Boolean
    optional: true
  sku:
    label: "SKU"
    type: String
    optional: true
  taxable:
    label: "Charge taxes on this product"
    type: Boolean
    optional: true
  title:
    label: "Title"
    type: String
  metafields:
    type: [MetafieldSchema]
    optional: true
  createdAt:
    label: "Created at"
    type: Date
  updatedAt:
    label: "Updated at"
    type: Date

ProductMediaSchema = new SimpleSchema
  src:
    type: String
  createdAt:
    type: Date
  updatedAt:
    type: Date
    optional: true
  mimeType:
    type: String
    optional: true
  metafields:
    type: [MetafieldSchema]
    optional: true

MetafieldSchema = new SimpleSchema
  key:
    type: String
    max: 30
  namespace:
    type: String
    max: 20
  value:
    type: String
  valueType:
    type: String
  description:
    type: String
    optional: true

CustomerAddressSchema = new SimpleSchema
  address1:
    type: String
  address2:
    type: String
    optional: true
  city:
    type: String
  company:
    type: String
    optional: true
  country:
    type: String
  firstName:
    type: String
  lastName:
    type: String
  phone:
    type: String
  province:
    type: String
  zip:
    type: Number
  provinceCode:
    type: String
  countryCode:
    type: String
  countryName:
    type: String
  default:
    type: Boolean
    optional: true

@Products = new Meteor.Collection2 'Products',
  schema:
    _id:
      type: String
      optional: true
    title:
      type: String
    bodyHtml:
      type: String
      optional: true
    productType:
      type: String
    vendor:
      type: String
      optional: true
    'options.$.name':
      type: String
      max: 255
    'options.$.defaultValue':
      type: String
      max: 255
    variants:
      type: [ProductVariantSchema]
      optional: true
    medias:
      type: [ProductMediaSchema]
      optional: true
    tags:
      type: [String]
      optional: true
    pageTitle:
      type: String
      optional: true
    metaDescription:
      type: String
      optional: true
    handle:
      type: String
    isVisible:
      type: Boolean
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

@Products.before.update (userId, doc, fieldNames, modifier, options) ->
  unless _.indexOf(fieldNames, 'medias') is -1
    addToSet = modifier.$addToSet?.medias
    if addToSet
      createdAt = new Date()
      if addToSet.$each
        _.each addToSet.$each, (image) ->
          image.createdAt = createdAt
      else
        addToSet.createdAt = createdAt

Products = @Products # package exports

@Customers = new Meteor.Collection2 'Customers',
  schema:
    email:
      type: String
    firstName:
      type: String
    lastName:
      type: String
    imageUrl:
      type: String
    addresses:
      type: [CustomerAddressSchema]
    defaultAddress:
      type: CustomerAddressSchema

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
    tags:
      type: [String]
      optional: true

    multipassIdentifier:
      type: String
      optional: true
    verifiedEmail:
      type: Boolean

    metafields:
      type: [MetafieldSchema]
      optional: true

    createdAt:
      type: Date
    updatedAt:
      type: Date

Customers = @Customers # package exports

@Orders = new Meteor.Collection('Orders')

Orders = @Orders # package exports
