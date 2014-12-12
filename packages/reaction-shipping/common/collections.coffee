###
#  Meteor.settings.paypal =
#    mode: false  #sandbox
#    client_id: ""
#    client_secret: ""
#  see: https://developer.paypal.com/webapps/developer/docs/api/
#  see: https://github.com/paypal/rest-api-sdk-nodejs
###

ReactionCore.Schemas.ShippingPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig
  {
    "settings.name":
      type: String
      defaultValue: "Flat Rate Service"
  }
])