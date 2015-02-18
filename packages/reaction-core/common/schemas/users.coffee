###
# AddressBook
###
ReactionCore.Schemas.Address = new SimpleSchema
  _id:
    type: String
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
# Customers
###
ReactionCore.Schemas.Customer = new SimpleSchema
  shopId:
    type: String
    autoValue: ReactionCore.shopIdAutoValue
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
