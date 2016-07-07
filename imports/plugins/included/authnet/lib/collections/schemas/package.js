/**
 * Meteor.settings.authnet =
 *   mode: false (sandbox)
 *   api_id: ""
 *   transaction_key: ""
 *   see: https://developer.authnet.com/webapps/developer/docs/api/
 *   see: https://github.com/authnet/rest-api-sdk-nodejs
 */

ReactionCore.Schemas.AuthNetPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    "settings.mode": {
      type: Boolean,
      defaultValue: false
    },
    "settings.api_id": {
      type: String,
      label: "API Login ID",
      min: 60
    },
    "settings.transaction_key": {
      type: String,
      label: "Transaction Key",
      min: 60
    }
  }
]);

ReactionCore.Schemas.AuthNetPayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name",
    regEx: /[A-Z][a-zA-Z]*/
  },
  cardNumber: {
    type: String,
    label: "Card number",
    min: 16
  },
  expireMonth: {
    type: String,
    label: "Expiration month",
    max: 2
  },
  expireYear: {
    type: String,
    label: "Expiration year",
    max: 4
  },
  cvv: {
    type: String,
    label: "CVV",
    max: 4
  }
});

ReactionCore.Schemas.AuthNetPayment.messages({
  "regEx payerName": "[label] must include both first and last name"
});
