

ProductVariant = new SimpleSchema
  barcode:
    type: String
    optional: true
  compareAtPrice:
    type: Number
    decimal: true
    optional: true
  fulfillmentService:
    type: String
    optional: true
  grams:
    type: Number
    optional: true
  inventoryManagement:
    type: String
    optional: true
  inventoryPolicy:
    type: String
    optional: true
  inventoryQuantity:
    type: Number
    optional: true
  option1:
    type: String
    optional: true
  option2:
    type: String
    optional: true
  option3:
    type: String
    optional: true
  position:
    type: Number
  price:
    type: Number
    decimal: true
  requiresShipping:
    type: Boolean
    optional: true
  sku:
    type: String
    optional: true
  taxable:
    type: Boolean
    optional: true
  title:
    type: String
    optional: true
  metafields:
    type: [MetafieldSchema]
    optional: true
  createdAt:
    type: Date
  updatedAt:
    type: Date

ProductImage = new SimpleSchema
  src:
    type: String
  position:
    type: Number
  createdAt:
    type: Date
  updatedAt:
    type: Date

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
    title:
      type: String
    description:
      type: String
      optional: true
    type:
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
      type: [ProductVariant]

    images:
      type: [ProductImage]

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

@Orders = new Meteor.Collection('Orders')
