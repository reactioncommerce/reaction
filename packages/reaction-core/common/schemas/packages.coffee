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
  property:
    type: String
    optional: true
  settings:
    type: Object
    optional: true
    blackbox: true
  registry:
    type: Object
    optional: true
    blackbox: true
