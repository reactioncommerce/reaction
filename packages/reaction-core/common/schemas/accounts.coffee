###
# Emails
###
ReactionCore.Schemas.Email = new SimpleSchema
  provides:
    type: String
    defaultValue: "default"
    optional: true
  address:
    type: String
    regEx: SimpleSchema.RegEx.Email
  verified:
    type: Boolean
    defaultValue: false
    optional: true

###
# AddressBook
###
ReactionCore.Schemas.Address = new SimpleSchema
  _id:
    type: String
    defaultValue: Random.id()
    optional: true
  fullName:
    type: String
    label: 'Full name'
  address1:
    label: "Address 1"
    type: String
  address2:
    label: "Address 2"
    type: String
    optional: true
  city:
    type: String
    label: "City"
  company:
    type: String
    label: "Company"
    optional: true
  phone:
    type: String
    label: "Phone"
  region:
    label: "State/Province/Region"
    type: String
  postal:
    label: "ZIP/Postal Code"
    type: String
  country:
    type: String
    label: "Country"
  isCommercial:
    label: "This is a commercial address."
    type: Boolean
    # defaultValue: false
  isBillingDefault:
    label: "Make this your default billing address?"
    type: Boolean
  isShippingDefault:
    label: "Make this your default shipping address?"
    type: Boolean
    # defaultValue: true
  metafields:
    type: [ReactionCore.Schemas.Metafield]
    optional: true


###
# Accounts
###
ReactionCore.Schemas.Accounts = new SimpleSchema
  userId:
    type: String
    optional: true
    regEx: SimpleSchema.RegEx.Id
    index: 1
  sessions:
    type: [String]
    optional: true
    index: 1
  shopId:
    type: String
    autoValue: ReactionCore.shopIdAutoValue
    regEx: SimpleSchema.RegEx.Id
    index: 1
  emails:
    type: [ReactionCore.Schemas.Email]
    optional: true
  acceptsMarketing:
    type: Boolean
    defaultValue: false
    optional: true
  state:
    type: String
    defaultValue: "new"
    optional: true
  note:
    type: String
    optional: true
  profile:
    type: Object
    optional: true
  'profile.addressBook':
    type: [ReactionCore.Schemas.Address]
    optional: true
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
    # denyUpdate: true
  updatedAt:
    type: Date
    autoValue: ->
      if @isUpdate
        return $set: new Date
      else if @isUpsert
        return $setOnInsert: new Date
    optional: true
