/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
// reaction modules
import { ExampleApi } from "./exampleapi";

/**
 * Meteor methods for Example Payment Plugin. Run these methods using `Meteor.call()`
 * @namespace Payment/Example/Methods
 */

Meteor.methods({
  /**
   * Capture a Charge
   * @method
   * @memberof Payment/Example/Methods
   * @param {Object} payment Object containing data about the transaction to capture
   * @return {Object} results normalized
   */
  "example/payment/capture"(payment) {
    check(payment, Object);

    const { amount, transactionId: authorizationId } = payment;
    const response = ExampleApi.methods.capture.call({
      authorizationId,
      amount
    });
    const result = {
      saved: true,
      response
    };
    return result;
  },

  /**
   * Create a refund
   * @method
   * @memberof Payment/Example/Methods
   * @param  {Object} payment object
   * @param  {Number} amount The amount to be refunded
   * @return {Object} result
   */
  "example/refund/create"(payment, amount) {
    check(amount, Number);
    check(payment, Object);

    const { transactionId } = payment;
    const response = ExampleApi.methods.refund.call({
      transactionId,
      amount
    });
    const results = {
      saved: true,
      response
    };
    return results;
  },

  /**
   * List refunds
   * @method
   * @memberof Payment/Example/Methods
   * @param  {Object} payment Object containing the payment data
   * @return {Object} result
   */
  "example/refund/list"(payment) {
    check(payment, Object);

    const { transactionId } = payment;
    const response = ExampleApi.methods.refunds.call({
      transactionId
    });
    const result = [];
    for (const refund of response.refunds) {
      result.push(refund);
    }

    // The results returned from the GenericAPI just so happen to look like exactly what the dashboard
    // wants. The return package should ba an array of objects that look like this
    // {
    //   type: "refund",
    //   amount: Number,
    //   created: Number: Epoch Time,
    //   currency: String,
    //   raw: Object
    // }
    const emptyResult = [];
    return emptyResult;
  }
});
