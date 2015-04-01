###
# Packages
###
ReactionCore.Schemas.PackageConfig = new SimpleSchema
  shopId:
    type: String
    index: 1
    autoValue: ReactionCore.shopIdAutoValue
  name:
    type: String
    index: 1
  enabled:
    type: Boolean
    defaultValue: true
    #configured in fixtures with autoEnable:true
  settings:
    type: Object
    optional: true
    blackbox: true
  shopPermissions:
    type: [Object]
    optional: true
    blackbox: true
  registry:
    type: [Object]
    optional: true
  'registry.$.provides':
    type: String
  'registry.$.route':
    type: String
    optional: true
  'registry.$.template':
    type: String
    optional: true
  'registry.$.description':
    type: String
    optional: true
  'registry.$.icon':
    type: String
    optional: true
  'registry.$.label':
    type: String
    optional: true
  'registry.$.container':
    type: String
    optional: true
  'registry.$.cycle':
    type: Number
    optional: true
  'registry.$.enabled':
    type: Boolean
    optional: true

###
# Core Reaction Settings
###
ReactionCore.Schemas.CorePackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig
  {
    "settings.mail":
      type: Object
      optional:true
      label: "Mail Settings"
    "settings.mail.user":
      type: String
      label: "Username"
    "settings.mail.password":
      type: String
      label: "Password"
    "settings.mail.host":
      type: String
      label: "Host"
    "settings.mail.port":
      type: String
      label: "Port"
    "settings.public":
      type: Object
      optional: true
    "settings.public.allowGuestCheckout":
      type: Boolean
      label: "Allow Guest Checkout"
  }
])
