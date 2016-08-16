import * as BraintreeMethods from "./braintreeMethods";
import { Meteor } from "meteor/meteor";

Meteor.methods({
  "braintreeSubmit": BraintreeMethods.paymentSubmit,
  "braintree/payment/capture": BraintreeMethods.paymentCapture,
  "braintree/refund/create": BraintreeMethods.createRefund,
  "braintree/refund/list": BraintreeMethods.listRefunds
});
