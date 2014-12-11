###
# Packages
###
#TODO Don't have to set and export PackageConfigSchema if we confirm that no pkgs use it
ReactionCore.Schemas.PackageConfig = new SimpleSchema
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