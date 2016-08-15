import * as PayflowproMethods from "./payflowproMethods";
import { Meteor } from "meteor/meteor";

Meteor.methods({
  "payflowproSubmit": PayflowproMethods.paymentSubmit,
  "payflowpro/payment/capture": PayflowproMethods.paymentCapture,
  "payflowpro/refund/create": PayflowproMethods.createRefund,
  "payflowpro/refund/list": PayflowproMethods.listRefunds
});
