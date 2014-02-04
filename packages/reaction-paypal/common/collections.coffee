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

@PaypalPaymentSchema = new SimpleSchema
  payerName:
    type: String
    label: "Cardholder name"
  cardNumber:
    type: String
    min: 16
    label: "Card number"
  expireMonth:
    type: String
    max: 2
    label: "Expiration month"
  expireYear:
    type: String
    max: 4
    label: "Expiration year"
  cvv:
    type: String
    max: 4
    label: "CVV"

PaypalPaymentSchema = @PaypalPaymentSchema