import { Meteor } from "meteor/meteor";
import * as BraintreeMethods from "./braintreeMethods";

Meteor.methods({
  "braintreeSubmit": BraintreeMethods.paymentSubmit,
  "braintree/payment/capture": BraintreeMethods.paymentCapture,
  "braintree/refund/create": BraintreeMethods.createRefund,
  "braintree/refund/list": BraintreeMethods.listRefunds
});
