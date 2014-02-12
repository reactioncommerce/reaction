MailgunSettingsSchema = new SimpleSchema
  settings:
    type: Object
    optional: true
  "settings.username":
    type: String
    label: "Username"
  "settings.password":
    type: String
    label: "Password"
  "settings.host":
    type: String
    label: "Host"
  "settings.port":
    type: Number
    label: "Port"
    allowedValues: [25, 587, 465, 475, 2525]
    optional: true
