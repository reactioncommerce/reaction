###
# Shops
###
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

ReactionCore.Schemas.Metafield = new SimpleSchema
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

ReactionCore.Schemas.Locale = new SimpleSchema
  continents:
    type: Object
    blackbox: true
  countries:
    type: Object
    blackbox: true


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
    optional: true
  domains:
    type: [String]
    defaultValue: ["localhost"]
  emails:
    type: [ReactionCore.Schemas.Email]
    optional: true
  currency:
    type: String
    defaultValue: "USD"
  currencies:
    type: ReactionCore.Schemas.Currency
  locale:
    type: String
    defaultValue: "en"
  locales:
    type: ReactionCore.Schemas.Locale
  languages:
    type: [Object]
    optional: true
  'languages.$.label':
    type: String
  'languages.$.i18n':
    type: String
  'languages.$.enabled':
    type: Boolean
    defaultValue: false
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
  metafields:
    type: [ReactionCore.Schemas.Metafield]
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
    autoValue : ->
      new Date()  if @isUpdate
    optional: true
