Meteor.methods({
  /**
   * Submit a card for Authorization
   * @param  {Object} transactionType authorize or capture
   * @param  {Object} cardData card Details
   * @param  {Object} paymentData The details of the Payment Needed
   * @return {Object} results normalized
   */
  "genericSubmit": function (transactionType, cardData, paymentData) {
    check(transactionType, String);
    check(cardData, {
      name: String,
      number: ValidCardNumber,
      expireMonth: ValidExpireMonth,
      expireYear: ValidExpireYear,
      cvv2: ValidCVV,
      type: String
    });

    check(paymentData, {
      total: String,
      currency: String
    });
    let total = parseFloat(paymentData.total);
    let result;
    try {
      let transaction = GenericAPI.methods.authorize.call({
        transactionType: transactionType,
        cardData: cardData,
        paymentData: paymentData
      });

      result = {
        saved: true,
        status: "created",
        currency: paymentData.currency,
        amount: total,
        transactionId: transaction.id,
        response: {
          amount: total,
          transactionId: transaction.id,
          currency: paymentData.currency
        }
      };
    } catch (error) {
      ReactionCore.Log.warn(error);
      result = {
        saved: false,
        error: error
      };
    }
    return result;
  },

  /**
   * Capture a Charge
   * @param {Object} paymentData Object containing data about the transaction to capture
   * @return {Object} results normalized
   */
  "generic/payment/capture": function (paymentData) {
    check(paymentData, ReactionCore.Schemas.PaymentMethod);
    let authorizationId = paymentData.transactionId;
    let amount = paymentData.amount;
    let response = GenericAPI.methods.capture.call({
      authorizationId: authorizationId,
      amount: amount
    });
    let result = {
      saved: true,
      response: response
    };
    return result;
  },

  /**
   * Create a refund
   * @param  {Object} paymentMethod object
   * @param  {Number} amount The amount to be refunded
   * @return {Object} result
   */
  "generic/refund/create": function (paymentMethod, amount) {
    check(paymentMethod, ReactionCore.Schemas.PaymentMethod);
    check(amount, Number);
    let { transactionId } = paymentMethod;
    let response = GenericAPI.methods.refund.call({
      transactionId: transactionId,
      amount: amount
    });
    let results = {
      saved: true,
      response: response
    };
    return results;
  },

  /**
   * List refunds
   * @param  {Object} paymentMethod Object containing the pertinant data
   * @return {Object} result
   */
  "generic/refund/list": function (paymentMethod) {
    check(paymentMethod, ReactionCore.Schemas.PaymentMethod);
    let { transactionId } = paymentMethod;
    let response = GenericAPI.methods.refunds.call({
      transactionId: transactionId
    });
    let result = [];
    for (let refund of response.refunds) {
      result.push(refund);
    }

    // The results retured from the GenericAPI just so happen to look like exactly what the dashboard
    // wants. The return package should ba an array of objects that look like this
    // {
    //   type: "refund",
    //   amount: Number,
    //   created: Number: Epoch Time,
    //   currency: String,
    //   raw: Object
    // }
    let emptyResult = [];
    return emptyResult;
  }
});

ValidCardNumber = Match.Where(function (x) {
  return /^[0-9]{14,16}$/.test(x);
});

ValidExpireMonth = Match.Where(function (x) {
  return /^[0-9]{1,2}$/.test(x);
});

ValidExpireYear = Match.Where(function (x) {
  return /^[0-9]{4}$/.test(x);
});

ValidCVV = Match.Where(function (x) {
  return /^[0-9]{3,4}$/.test(x);
});

chargeObj = function () {
  return {
    amount: "",
    currency: "",
    card: {},
    capture: true
  };
};

parseCardData = function (data) {
  return {
    number: data.number,
    name: data.name,
    cvc: data.cvv2,
    expireMonth: data.expire_month,
    expireYear: data.expire_year
  };
};

