share.ReactionPalette = @ReactionPalette = new Meteor.Collection(null)
share.ConfigData = @ConfigData = new Meteor.Collection("ConfigData")

Users = @Users = Meteor.users

@PackageConfigSchema = new SimpleSchema
  shopId:
    type: String
  name:
    type: String
    optional: true
  settings:
    type: Object
    optional: true
    blackbox: true

PackageConfigSchema = @PackageConfigSchema

@Packages = new Meteor.Collection("Packages",[PackageConfigSchema])
Packages = @Packages

ShopMemberSchema = new SimpleSchema
  userId:
    type: String
  isAdmin:
    type: Boolean
    optional: true
  permissions:
    type: [String]
    optional: true

CustomEmailSettings = new SimpleSchema
  username:
    type: String
    optional: true
  password:
    type: String
    optional: true
  host:
    type: String
    optional: true
  port:
    type: Number
    allowedValues: [25, 587, 465, 475, 2525]
    optional: true

MetafieldSchema = new SimpleSchema
  key:
    type: String
    max: 30
    optional: true
  namespace:
    type: String
    max: 20
    optional: true
  scope:
    type: String
    optional: true
  value:
    type: String
    optional: true
  valueType:
    type: String
    optional: true
  description:
    type: String
    optional: true


VariantMediaSchema = new SimpleSchema
  mediaId:
    type: String
    optional: true
  priority:
    type: Number
    optional: true
  metafields:
    type: [MetafieldSchema]
    optional: true
  updatedAt:
    type: Date
    optional: true
  createdAt:
    type: Date

ProductPositionSchema = new SimpleSchema
  tag:
    type: String
    optional: true
  position:
    type: Number
    optional: true
  sizing:
    type: String
    optional: true

@ProductVariantSchema = new SimpleSchema
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
    label: "Weight (.oz)"
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
    type: [MetafieldSchema]
    optional: true
  medias:
    type: [VariantMediaSchema]
    optional: true
  positions:
    type: [ProductPositionSchema]
    optional: true
  createdAt:
    label: "Created at"
    type: Date
    optional: true
  updatedAt:
    label: "Updated at"
    type: Date
    optional: true

ProductVariantSchema = @ProductVariantSchema

@AddressSchema = new SimpleSchema
  _id:
    type: String
    optional: true
  fullName:
    type: String
  address1:
    label: "Address 1"
    type: String
  address2:
    label: "Address 2"
    type: String
    optional: true
  city:
    type: String
  company:
    type: String
    optional: true
  phone:
    type: String
    label: "Phone"
    min: 7
    max: 22
    regEx: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
  region:
    label: "State/Province/Region"
    type: String
  postal:
    label: "ZIP/Postal Code"
    type: String
  country:
    type: String
  isCommercial:
    label: "This is a commercial address"
    type: Boolean
  isDefault:
    label: "This is my default address"
    type: Boolean
  metafields:
    type: [MetafieldSchema]
    optional: true

AddressSchema = @AddressSchema

CountrySchema = new SimpleSchema
  name:
    type: String
  code:
    type: String

TaxSchema = new SimpleSchema
  taxShipping:
    type: String
    optional: true
  taxesIncluded:
    type: Boolean
    optional: true
  countyTaxes:
    type: Boolean
    optional: true
  metafields:
    type: [MetafieldSchema]
    optional: true

@Shops = new Meteor.Collection 'Shops',
  schema:
    _id:
      type: String
      optional: true
    name:
      type: String
      index: 1
    addressBook:
      type: [AddressSchema]
    domains:
      type: [String]
      #defaultValue: ["localhost"] #see simple schema issue #73
    currency:
      type: String
    email:
      type: String
    moneyFormat:
      type: String
    moneyWithCurrencyFormat:
      type: String
    moneyInEmailsFormat:
      type: String
    moneyWithCurrencyInEmailsFormat:
      type: String
    taxes:
      type: [TaxSchema]
      optional: true
    public:
      type: String
      optional: true
    timezone:
      type: String
    ownerId:
      type: String
    members:
      type: [ShopMemberSchema]
      index: 1
    useCustomEmailSettings:
      type: Boolean
      optional: true
    customEmailSettings:
      type: CustomEmailSettings
    createdAt:
      type: Date
    updatedAt:
      type: Date
      autoValue : ->
        new Date()  if @isUpdate
      optional: true
  transform: (shop) ->
    for index, member of shop.members
      member.index = index
      member.user = Meteor.users.findOne member.userId
    shop

Shops = @Shops # package exports


@Products = new Meteor.Collection 'Products',
  schema:
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
      type: [MetafieldSchema]
      optional: true
    variants:
      type: [ProductVariantSchema]
    tagIds:
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
  # transform: (product) ->
  #   product.price = (product.price).toFixed(2)
  #   updatedAt = new Date()
  #   product

Products = @Products # package exports

@Customers = new Meteor.Collection 'Customers',
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

# @Customers.before.update (userId, doc, fieldNames, modifier, options) ->
#    modifier.$set.updatedAt = new Date()

@Orders = new Meteor.Collection("Orders",[Cart,OrderItemsSchema])

OrderItemsSchema = new SimpleSchema
    additionalField:
      type: String
      optional: true
    status:
      type: String
    history:
      type: [HistorySchema]
      optional: true
    documents:
      type: [DocumentSchema]
      optional: true

DocumentSchema = new SimpleSchema
  docId:
    type: String
  docType:
    type: String
    optional: true

HistorySchema = new SimpleSchema
    event:
      type: String
    userId:
      type: String
    updatedAt:
      type: Date

Orders = @Orders # package exports

CartItemSchema = new SimpleSchema
  _id:
    type: String
  productId:
    type: String
  quantity:
    label: "Quantity"
    type: Number
    min: 0
  variants:
    type: ProductVariantSchema


ShipmentQuoteSchema = new SimpleSchema
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


ShipmentSchema = new SimpleSchema
  address:
    type: AddressSchema
    optional: true
  shipmentMethod:
    type: ShipmentQuoteSchema
    optional: true

@PaymentMethodSchema = new SimpleSchema
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
  mode:
    type: String
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

PaymentMethodSchema = @PaymentMethodSchema

PaymentSchema = new SimpleSchema
  address:
    type: AddressSchema
    optional: true
  paymentMethod:
    type: [PaymentMethodSchema]
    optional: true

@Cart = new Meteor.Collection 'Cart',
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
    shipping:
      type: ShipmentSchema
      optional:true
    payment:
      type: PaymentSchema
      optional:true
    totalPrice:
      label: "Total Price"
      type: Number
      optional: true
      decimal: true
      min: 0
    state:
      type: String
      optional: true
    createdAt:
      type: Date
    updatedAt:
      type: Date


Cart = @Cart # package exports

@Tags = new Meteor.Collection 'Tags',
  schema:
    name:
      type: String
      index: 1
    slug:
      type: String
    position:
      type: Number
      optional: true
    relatedTagIds:
      type: [String]
      optional: true
      index: 1
    isTopLevel:
      type: Boolean
    shopId:
      type: String
      index: 1
    createdAt:
      type: Date
    updatedAt:
      type: Date

Tags = @Tags
