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
  emails: [{'address': 'root@localhost', 'verified': true}]
  currency: "USD"
  currencies:
    "USD":
      "format": "%s%v"
      "symbol": "$"
    "EUR":
      "format": "%v %s"
      "symbol": "€"
      "decimal": ","
      "thousand": "."
  locale: "en"
  locales:
    continents:
      'NA': 'North America'
    countries:
      'US':
        "name": "United States",
        "native": "United States",
        "phone": "1",
        "continent": "NA",
        "capital": "Washington D.C.",
        "currency": "USD,USN,USS",
        "languages": "en"
  public: true
  timezone: -> "US/Pacific"
  baseUOM: "OZ"
  metafields: []
  defaultRoles: [ "guest", "account/profile" ]
  createdAt: -> new Date()
  updatedAt: -> new Date()

Factory.define 'account', ReactionCore.Collections.Accounts,
  shopId: Factory.get 'shop'
  userId: Accounts.createUser(Fake.user())
  emails: -> [
    address: Fake.word() + '@example.com'
    verified: Fake.fromArray([true, false])
  ]
  acceptsMarketing: true
  state: 'new'
  note: -> Fake.sentence 20
  profile:
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
  metafields: []
  createdAt: -> new Date()
  updatedAt: -> new Date()


Factory.define 'product', ReactionCore.Collections.Products,
  shopId: Factory.get 'shop'
  title: Fake.word
  pageTitle: -> Fake.sentence 5
  description: -> Fake.paragraph 20
  type: -> "simple"
  vendor: ''
#   metafields:
  variants: -> [
    _id: Random.id()
    compareAtPrice: _.random 0, 1000
    weight: _.random 0, 10
    inventoryManagement: true
    inventoryPolicy: false
    lowInventoryWarningThreshold: 1
    inventoryQuantity: _.random 0, 100
    price: _.random 10, 1000
    optionTitle: Fake.word()
    title: Fake.word()
    sku: _.random 0, 6
    taxable: true
    metafields: [
      key: Fake.word()
      value: Fake.word()
      scope: "detail"
    ,
      key: "facebook"
      value: Fake.paragraph()
      scope: "socialMessages"
    ,
      key: "twitter"
      value: Fake.sentence()
      scope: "socialMessages"
    ]
  ]
  requiresShipping: true
#   parcel:
  hashtags: []
#   twitterMsg:
#   facebookMsg:
#   googleplusMsg:
#   pinterestMsg:
#   metaDescription:
#   handle:
  isVisible: false
  publishedAt: -> new Date
#   publishedScope:
#   templateSuffix:
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

Factory.define 'cart', ReactionCore.Collections.Cart,
  shopId: Factory.get 'shop'
  userId: Random.id() #link to user factory
  sessions: [Random.id()]
  email: Fake.email
  items: [
    _id: Random.id()
    productId: Random.id()
    shopId: Random.id()
    quantity: _.random 1, 5
    variants:
      _id: Random.id()
      compareAtPrice: _.random 0, 1000
      weight: _.random 0, 10
      inventoryManagement: true
      inventoryPolicy: false
      lowInventoryWarningThreshold: 1
      inventoryQuantity: _.random 0, 100
      price: _.random 10, 1000
      optionTitle: Fake.word()
      title: Fake.word()
      sku: Fake.word()
      taxable: true
      metafields: [
        key: Fake.word()
        value: Fake.word()
        scope: "detail"
      ,
        key: "facebook"
        value: Fake.paragraph()
        scope: "socialMessages"
      ,
        key: "twitter"
        value: Fake.sentence()
        scope: "socialMessages"
      ]
  ,
    _id: Random.id()
    productId: Random.id()
    shopId: Random.id()
    quantity: _.random 1, 5
    variants:
      _id: Random.id()
      compareAtPrice: _.random 0, 1000
      weight: _.random 0, 10
      inventoryManagement: true
      inventoryPolicy: false
      lowInventoryWarningThreshold: 1
      inventoryQuantity: _.random 0, 100
      price: _.random 10, 1000
      optionTitle: Fake.word()
      title: Fake.word()
      sku: _.random 0, 6
      taxable: true
      metafields: [
        key: Fake.word()
        value: Fake.word()
        scope: "detail"
      ,
        key: "facebook"
        value: Fake.paragraph()
        scope: "socialMessages"
      ,
        key: "twitter"
        value: Fake.sentence()
        scope: "socialMessages"
      ]
  ]
  requiresShipping: true
  shipping: {} #Shipment schema
  payment: {} #Payment schema
  totalPrice: _.random 1, 1000
  state: 'new'
  createdAt: new Date
  updatedAt: new Date

Factory.define 'order', ReactionCore.Collections.Orders,
  # Schemas.OrderItems
  additionalField: Fake.sentence 2
  status: Fake.sentence 3
  history: []
  documents: []
  
  # Schemas.order
  cartId: Factory.get 'cart'
  notes: []
  
  # Schemas.cart
  shopId: Random.id()
  userId: Random.id() #link to user factory
  sessions: ['Session']
  email: Fake.email
  items: [
    _id: Random.id()
    productId: Random.id()
    shopId: Random.id()
    quantity: _.random 1, 5
    variants:
      _id: Random.id()
      compareAtPrice: _.random 0, 1000
      weight: _.random 0, 10
      inventoryManagement: true
      inventoryPolicy: false
      lowInventoryWarningThreshold: 1
      inventoryQuantity: _.random 0, 100
      price: _.random 10, 1000
      optionTitle: Fake.word()
      title: Fake.word()
      sku: _.random 0, 6
      taxable: true
      metafields: [
        key: Fake.word()
        value: Fake.word()
        scope: "detail"
      ,
        key: "facebook"
        value: Fake.paragraph()
        scope: "socialMessages"
      ,
        key: "twitter"
        value: Fake.sentence()
        scope: "socialMessages"
      ]
  ,
    _id: Random.id()
    productId: Random.id()
    shopId: Random.id()
    quantity: _.random 1, 5
    variants:
      _id: Random.id()
      compareAtPrice: _.random 0, 1000
      weight: _.random 0, 10
      inventoryManagement: true
      inventoryPolicy: false
      lowInventoryWarningThreshold: 1
      inventoryQuantity: _.random 0, 100
      price: _.random 10, 1000
      optionTitle: Fake.word()
      title: Fake.word()
      sku: _.random 0, 6
      taxable: true
      metafields: [
        key: Fake.word()
        value: Fake.word()
        scope: "detail"
      ,
        key: "facebook"
        value: Fake.paragraph()
        scope: "socialMessages"
      ,
        key: "twitter"
        value: Fake.sentence()
        scope: "socialMessages"
      ]
  ]
  requiresShipping: true
  shipping: {} #Shipment schema
  payment: {} #Payment schema
  totalPrice: _.random 1, 1000
  state: 'new'
  createdAt: new Date
  updatedAt: new Date
