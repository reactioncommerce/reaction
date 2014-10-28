# TODO see if these are needed/used and whether they should have schemas
share.ReactionPalette = @ReactionPalette = new Meteor.Collection(null)
share.Product = @Product = new Meteor.Collection("Product")
share.Variant = @Variant = new Meteor.Collection("Variant")

ReactionCore.Collections.Translations = new Meteor.Collection "Translations"

###
# Packages
###
#TODO Don't have to set and export PackageConfigSchema if we confirm that no pkgs use it
ReactionCore.Schemas.PackageConfig = PackageConfigSchema = new SimpleSchema
  shopId:
    type: String
    index: 1
    autoValue: ->
      if this.isInsert
        return ReactionCore.getShopId() or "1" if Meteor.isClient
        # force the correct value upon insert
        return ReactionCore.getShopId()
      else
        # don't allow updates
        this.unset();
  name:
    type: String
    index: 1
  enabled:
    type: Boolean
    defaultValue: true
  property:
    type: String
    optional: true
  settings:
    type: Object
    optional: true
    blackbox: true

ReactionCore.Collections.Packages = new Meteor.Collection "Packages"
ReactionCore.Collections.Packages.attachSchema PackageConfigSchema

###
# Shops
###
#TODO Don't have to set and export ShopMemberSchema if we confirm that no pkgs use it
ReactionCore.Schemas.ShopMember = ShopMemberSchema = new SimpleSchema
  userId:
    type: String
  isAdmin:
    type: Boolean
    optional: true
  permissions:
    type: [String]
    optional: true

ReactionCore.Schemas.CustomEmailSettings = new SimpleSchema
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

#TODO Don't have to set and export MetafieldSchema if we confirm that no pkgs use it
ReactionCore.Schemas.Metafield = MetafieldSchema = new SimpleSchema
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

#TODO Don't have to set and export VariantMediaSchema if we confirm that no pkgs use it
ReactionCore.Schemas.VariantMedia = VariantMediaSchema = new SimpleSchema
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

#TODO Don't have to set and export AddressSchema if we confirm that no pkgs use it
ReactionCore.Schemas.Address = AddressSchema = new SimpleSchema
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
    defaultValue: false
  isDefault:
    label: "This is my default address"
    type: Boolean
    defaultValue: true
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true

#if i18n.t('addressSchema.fullName') isnt 'addressSchema.fullName' then return i18n.t('addressSchema.fullName')
# MySchema.labels password: "Enter your password"
# AddressSchema.labels
#   password: "Enter your password"
#   test: "test"

ReactionCore.Schemas.Currency = new SimpleSchema
  symbol:
    type: String
    defaultValue: "$"
  format:
    type: String
    defaultValue: "%s%v"
  precision:
    type: String
    defaultValue: "0"
    optional: true
  decimal:
    type: String
    defaultValue: "."
    optional: true
  thousand:
    type: String
    defaultValue: ","
    optional: true

ReactionCore.Schemas.Country = new SimpleSchema
  name:
    type: String
  code:
    type: String

ReactionCore.Schemas.Tax = new SimpleSchema
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
    type: [ReactionCore.Schemas.Metafield]
    optional: true

ReactionCore.Schemas.currencyEngine = new SimpleSchema
  provider:
    type: String
    defaultValue: "OXR"
  apiKey:
    type: String
    optional: true
    label: "Open Exchange Rates App ID"

ReactionCore.Schemas.Shop = new SimpleSchema
  _id:
    type: String
    optional: true
  name:
    type: String
    index: 1
  description:
    type: String
    optional: true
  keywords:
    type: String
    optional: true
  addressBook:
    type: [ReactionCore.Schemas.Address]
  domains:
    type: [String]
    defaultValue: ["localhost"] #see simple schema issue #73
  email:
    type: String
  currency:
    type: String
    defaultValue: "USD"
  currencyEngine:
    type: ReactionCore.Schemas.currencyEngine
  currencies:
    type: [ReactionCore.Schemas.Currency]
  taxes:
    type: [ReactionCore.Schemas.Tax]
    optional: true
  public:
    type: String
    optional: true
  timezone:
    type: String
  baseUOM:
    type: String
    optional: true
    defaultValue: "OZ"
    label: "Base Unit of Measure"
  ownerId:
    type: String
  members:
    type: [ReactionCore.Schemas.ShopMember]
    index: 1
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true
  useCustomEmailSettings:
    type: Boolean
    optional: true
  customEmailSettings:
    type: ReactionCore.Schemas.CustomEmailSettings
  createdAt:
    type: Date
  updatedAt:
    type: Date
    autoValue : ->
      new Date()  if @isUpdate
    optional: true

ReactionCore.Collections.Shops = Shops = @Shops = new Meteor.Collection "Shops",
  transform: (shop) ->
    for index, member of shop.members
      member.index = index
      member.user = Meteor.users.findOne member.userId
    return shop

ReactionCore.Collections.Shops.attachSchema ReactionCore.Schemas.Shop

# XXX Unused?
ReactionCore.Schemas.Social = new SimpleSchema
  service:
    type: String
  handle:
    type: String

###
# Products
###
#TODO Don't have to set and export ProductVariantSchema if we confirm that no pkgs use it
ReactionCore.Schemas.ProductVariant = ProductVariantSchema = new SimpleSchema
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

ReactionCore.Collections.Products = Products = @Products = new Meteor.Collection "Products"
ReactionCore.Collections.Products.attachSchema ReactionCore.Schemas.Product

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

ReactionCore.Collections.Customers = Customers = @Customers = new Meteor.Collection "Customers"
ReactionCore.Collections.Customers.attachSchema ReactionCore.Schemas.Customer

###
# Carts
###
#TODO Don't have to set and export CartItemSchema if we confirm that no pkgs use it
ReactionCore.Schemas.CartItem = CartItemSchema = new SimpleSchema
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

ReactionCore.Schemas.ShipmentQuote = new SimpleSchema
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

ReactionCore.Schemas.Shipment = new SimpleSchema
  address:
    type: ReactionCore.Schemas.Address
    optional: true
  shipmentMethod:
    type: ReactionCore.Schemas.ShipmentQuote
    optional: true

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

ReactionCore.Schemas.Payment = new SimpleSchema
  address:
    type: ReactionCore.Schemas.Address
    optional: true
  paymentMethod:
    type: [ReactionCore.Schemas.PaymentMethod]
    optional: true

ReactionCore.Schemas.Cart = new SimpleSchema
  shopId:
    type: String
    index: 1
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
    denyInsert: true
    optional: true

ReactionCore.Collections.Cart = Cart = @Cart = new Meteor.Collection "Cart"
ReactionCore.Collections.Cart.attachSchema ReactionCore.Schemas.Cart

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

ReactionCore.Collections.Orders = Orders = @Orders = new Meteor.Collection "Orders"
ReactionCore.Collections.Orders.attachSchema [ReactionCore.Schemas.Cart, ReactionCore.Schemas.OrderItems]

###
# Tags
###
ReactionCore.Schemas.Tag = new SimpleSchema
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

ReactionCore.Collections.Tags = Tags = @Tags = new Meteor.Collection "Tags"
ReactionCore.Collections.Tags.attachSchema ReactionCore.Schemas.Tag
