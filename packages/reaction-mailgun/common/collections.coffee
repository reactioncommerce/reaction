@MailgunConfigSchema = new SimpleSchema([
  PackageConfigSchema
  {
    settings:
      type: Object
      optional: true
    "settings.host":
      type: String
      label: "Host"
    "settings.port":
      type: Number
      label: "Port"
      allowedValues: [25, 587, 465, 475, 2525]
      defaultValue: 25
      optional: true
    "settings.username":
      type: String
      label: "Username"
    "settings.password":
      type: String
      label: "Password"
  }
])

###
# Fixture - we always want a record
###
Meteor.startup ->
  unless Packages.findOne({name:"reaction-mailgun"})
    Shops.find().forEach (shop) ->
      Packages.insert
        shopId: shop._id
        name: "reaction-mailgun"
        settings: Meteor.settings.mailgun