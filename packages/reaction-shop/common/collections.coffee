UserPermissionSchema = new SimpleSchema
  userId:
    type: String
  permission:
    type: String

MetafieldSchema = new SimpleSchema
  key:
    type: String
    max: 30
  namespace:
    type: String
    max: 20
    optional: true
  value:
    type: String
  description:
    type: String
    optional: true

VariantMediaSchema = new SimpleSchema
  src:
    type: String
  mimeType:
    type: String
    optional: true
  metafields:
    type: [MetafieldSchema]
    optional: true
  updatedAt:
    type: Date
    optional: true
  createdAt:
    type: Date


ProductVariantSchema = new SimpleSchema
  _id:
    type: String
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
  medias:
    type: [VariantMediaSchema]
    optional: true
  createdAt:
    label: "Created at"
    type: Date
  updatedAt:
    label: "Updated at"
    type: Date

CustomerAddressSchema = new SimpleSchema
  _id:
    type: String
    optional: true
  fullName:
    type: String
  address1:
    label: "Address 1"
    type: String
  address2:
    type: String
    optional: true
  city:
    type: String
  company:
    type: String
    optional: true
  phone:
    type: String
  region:
    label: "State/Province/Region"
    type: String
  postal:
    label: "ZIP/Postal Code"
    type: String
  country:
    type: String
  isCommercial:
    label: "Is this a commercial address?"
    type: Boolean
    optional: true
  isDefault:
    label: "Make this your default address?"
    type: Boolean
    optional: true

CountrySchema = new SimpleSchema
  name:
    type: String
  code:
    type: String

@Shops = new Meteor.Collection2 'Shops',
  schema:
    _id:
      type: String
      optional: true
    address1:
      type: String
      optional: true
    city:
      type: String
      optional: true
    country:
      type: String
    countryCode:
      type: String
    countryName:
      type: String
    customerEmail:
      type: String
    currency:
      type: String
    domains:
      type: [String]
    email:
      type: String
    googleAppsDomain:
      type: String
      optional: true
    googleAppsLoginEnabled:
      type: String
      optional: true
    id:
      type: Number
      optional: true
    latitude:
      type: Number
      decimal: true
    longitude:
      type: Number
      decimal: true
    moneyFormat:
      type: String
    moneyWithCurrencyFormat:
      type: String
    moneyInEmailsFormat:
      type: String
    moneyWithCurrencyInEmailsFormat:
      type: String
    myShopDomain:
      type: String
      optional: true
    name:
      type: String
    planName:
      type: String
      optional: true
    planDisplayName:
      type: String
      optional: true
    phone:
      type: String
      optional: true
    province:
      type: String
      optional: true
    provinceCode:
      type: String
      optional: true
    public:
      type: String
      optional: true
    shopOwner:
      type: String
      optional: true
    source:
      type: String
      optional: true
    taxShipping:
      type: String
      optional: true
    taxesIncluded:
      type: Boolean
      optional: true
    countyTaxes:
      type: Boolean
      optional: true
    timezone:
      type: String
    zip:
      type: String
      optional: true
    eligibleForPayments:
      type: Boolean
      optional: true
    requiresExtraPaymentsAgreement:
      type: Boolean
      optional: true
    metaTitle:
      type: String
      optional: true
    metaDescription:
      type: String
      optional: true
    ownerId:
      type: String
    admins:
      type: [String]
    usersPermissions:
      type: [UserPermissionSchema]
    createdAt:
      type: Date
    updatedAt:
      type: Date
      optional: true

Shops = @Shops # package exports

@Products = new Meteor.Collection2 'Products',
  schema:
    _id:
      type: String
      optional: true
    shopId:
      type: String
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
    tagIds:
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
    tagIds:
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

@Orders = new Meteor.Collection2 'Orders',
  schema:
    shopId:
      type: String

Orders = @Orders # package exports

CartItemSchema = new SimpleSchema
  productId:
    type: String
  quantity:
    label: "Quantity"
    type: Number
    min: 0
  variants:
    type: [ProductVariantSchema]

@Cart = new Meteor.Collection2 'Cart',
  schema:
    shopId:
      type: String
    sessionId:
      type: String
    userId:
      type: String
      optional: true
    items:
      type: [CartItemSchema]
      optional: true
    requiresShipping:
      label: "Require a shipping address"
      type: Boolean
      optional: true
    totalPrice:
      label: "Total Price"
      type: Number
      optional: true
      decimal: true
      min: 0
    createdAt:
      type: Date
    updatedAt:
      type: Date

Cart = @Cart # package exports

@Tags = new Meteor.Collection2 'Tags',
  schema:
    name:
      type: String
    slug:
      type: String
    position:
      type: Number
      optional: true
    relatedTagIds:
      type: [String]
      optional: true
    isTopLevel:
      type: Boolean
    shopId:
      type: String
    createdAt:
      type: Date
    updatedAt:
      type: Date

Tags = @Tags
