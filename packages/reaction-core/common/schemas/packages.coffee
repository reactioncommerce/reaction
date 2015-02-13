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
  'registry.$.group':
    type: String
    optional: true
  'registry.$.priority':
    type: Number
    optional: true
