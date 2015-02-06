Factory.define 'shop', ReactionCore.Collections.Shops,
  name: -> Fake.sentence 2
  description: -> Fake.paragraph 20
  keywords: -> Fake.sentence 20
  addressBook: -> [
    fullName: Fake.sentence 2
    address1: Fake.sentence 2
    address2: Fake.sentence 2
    city: Fake.word()
    company: Fake.word()
    phone: "Phone"
    region: Fake.word()
    postal: _.random 10000, 100000
    country: "USA"
    isCommercial: false
    isShippingDefault: true
    isBillingDefault: true
    metafields: undefined
  ]
  domains: ["localhost"]
  email: 'root@localhost'
  currency: "USD"
  currencyEngine: undefined
  currencies: []
  public: true
  timezone: '1'
  baseUOM: "OZ"
  ownerId: '1'
  members: []
  metafields: []
  useCustomEmailSettings: false
  customEmailSettings:
    username: ''
    password: ''
    host: ''
    port: 25
  createdAt: -> new Date()
  updatedAt: -> new Date()


Factory.define 'product', ReactionCore.Collections.Products,
  shopId: Factory.get 'shop'
  title: Fake.word
  pageTitle: -> Fake.sentence 5
  description: -> Fake.paragraph 20
  productType: -> Fake.sentence 2
  vendor: ''
#   metafields:
  variants: -> [
    # TODO: can not do Factory.get 'productVariants' due to RangeError: Maximum call stack size exceeded
    _id: 1
    compareAtPrice: _.random 0, 1000
    weight: _.random 0, 10
    inventoryManagement: false
    inventoryPolicy: false
    lowInventoryWarningThreshold: 1
    price: _.random 10, 1000
    title: Fake.word()
    optionTitle: Fake.word()
    createdAt: new Date
    updatedAt: new Date
  ]
  requiresShipping: true
#   parcel:
  hashtags: []
#   twitterMsg:
#   facebookMsg:
#   instagramMsg:
#   pinterestMsg:
#   metaDescription:
#   handle:
  isVisible: true
  publishedAt: -> new Date
#   publishedScope:
#   templateSuffix:
  createdAt: -> new Date
  updatedAt: -> new Date


Factory.define 'productVariants', new Meteor.Collection('ProductVariants'),
#  parentId: 1
#  cloneId:
#  index:
#  barcode:
  compareAtPrice: -> _.random 0, 1000
#  fulfillmentService:
  weight: -> _.random 0, 1000
  inventoryManagement: false
  inventoryPolicy: false
  lowInventoryWarningThreshold: 1
  inventoryQuantity: -> _.random 0, 100
  price: -> _.random 10, 1000
#  sku:
#  taxable:
  title: Fake.word
  optionTitle: Fake.word
#  metafields:
#  positions:
  createdAt: -> new Date
  updatedAt: -> new Date


Factory.define 'tag', ReactionCore.Collections.Tags,
  name: Fake.word
  slug: Fake.word
  position: -> _.random 0, 100000
#  relatedTagIds: []
  isTopLevel: true
  shopId: Factory.get 'shop'
  createdAt: -> new Date
  updatedAt: -> new Date
