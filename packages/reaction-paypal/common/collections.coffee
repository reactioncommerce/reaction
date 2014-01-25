# "paypal": {
# "host": "api.sandbox.paypal.com",
# "port": "",
# "client_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
# "client_secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

PaypalPackageSchema = new SimpleSchema
  settings:
    type: Object
    optional: true
  "settings.host":
    type: String
    label: "Host"
    #regEx: /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i
  "settings.port":
    type: String
    label: "Port"
    optional: true
  "settings.client_id":
    type: String
    label: "API Id"
    min: 60
  "settings.client_secret":
    type: String
    label: "API Secret"
    min: 60
