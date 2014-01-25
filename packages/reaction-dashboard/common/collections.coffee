# *****************************************************
# define meteor/mongo collections for reaction
#
# *****************************************************
Packages = new Meteor.Collection("Packages",[PackageConfigSchema])

@PackageConfigSchema = new SimpleSchema
  shopId:
    type: String
  name:
    type: String
    optional: true
  settings:
    type: Object
    optional: true
