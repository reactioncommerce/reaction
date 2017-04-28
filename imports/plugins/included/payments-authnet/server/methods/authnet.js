/* eslint camelcase: 0 */
/* eslint quote-props: 0 */
// meteor modules
import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Promise } from "meteor/promise";

import AuthNetAPI from "@reactioncommerce/authorize-net";
import { Reaction, Logger } from "/server/api";
import { Packages } from "/lib/collections";
import { PaymentMethod } from "/lib/collections/schemas";

function getAccountOptions() {
  const settings = Packages.findOne({
    name: "reaction-auth-net",
    shopId: Reaction.getShopId(),
    enabled: true
  }).settings;
  const ref = Meteor.settings.authnet;
  const options = {
    login: getSettings(settings, ref, "api_id"),
    tran_key: getSettings(settings, ref, "transaction_key")
  };

  if (!options.login) {
    throw new Meteor.Error("invalid-credentials", "Invalid Authnet Credentials");
  }
  return options;
}

function getSettings(settings, ref, valueName) {
  if (settings !== null) {
    return settings[valueName];
  } else if (ref !== null) {
    return ref[valueName];
  }
  return undefined;
}

Meteor.methods({
  authnetSubmit: function (transactionType = "authorizeTransaction", cardInfo, paymentInfo) {
    check(transactionType, String);
    check(cardInfo, {
      cardNumber: ValidCardNumber,
      expirationYear: ValidExpireYear,
      expirationMonth: ValidExpireMonth,
      cvv2: ValidCVV
    });
    check(paymentInfo, {
      total: String,
      currency: String
    });

    const order = {
      amount: paymentInfo.total
    };
    const creditCard = {
      creditCardNumber: cardInfo.cardNumber,
      cvv2: cardInfo.cvv2,
      expirationYear: cardInfo.expirationYear,
      expirationMonth: cardInfo.expirationMonth
    };
    const authnetService = getAuthnetService(getAccountOptions());
    const authnetTransactionFunc = authnetService[transactionType];
    let authResult;
    if (authnetTransactionFunc) {
      try {
        authResult = authnetTransactionFunc.call(authnetService,
          order,
          creditCard
        );
      } catch (error) {
        Logger.fatal(error);
      }
    } else {
      throw new Meteor.Error("403", "Invalid Transaction Type");
    }

    const result =  Promise.await(authResult);
    return result;
  },

  "authnet/payment/capture": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    const {
      transactionId,
      amount
    } = paymentMethod;

    const authnetService = getAuthnetService(getAccountOptions());
    const roundedAmount = parseFloat(amount.toFixed(2));
    const capturedAmount = accounting.toFixed(amount, 2);
    let result;
    if (capturedAmount === accounting.toFixed(0, 2)) {
      try {
        const captureResult = voidTransaction(transactionId,
          authnetService
        );
        if (captureResult.responseCode[0] === "1") {
          result = {
            saved: true,
            response: captureResult
          };
        } else {
          result = {
            saved: false,
            error: captureResult
          };
        }
      } catch (error) {
        Logger.fatal(error);
        result = {
          saved: false,
          error: error
        };
      }
      return result;
    }
    try {
      const captureResult = priorAuthCaptureTransaction(transactionId,
        roundedAmount,
        authnetService
      );
      if (captureResult.responseCode[0] === "1") {
        result = {
          saved: true,
          response: captureResult
        };
      } else {
        result = {
          saved: false,
          error: captureResult
        };
      }
    } catch (error) {
      Logger.fatal(error);
      result = {
        saved: false,
        error: error
      };
    }
    return result;
  },

  "authnet/refund/create": function (paymentMethod, amount) {
    check(paymentMethod, PaymentMethod);
    check(amount, Number);
    const result = {
      saved: false,
      error: "Reaction does not yet support direct refund processing from Authorize.net. " +
      "Please visit their web portal to perform this action. https://account.authorize.net/"
    };

    return result;
  },
  "authnet/refund/list": function () {
    check(arguments, [Match.Any]);
    Meteor.Error("Not Implemented", "Authorize.net does not yet support retrieving a list of refunds.");
  }
});

function getAuthnetService(accountOptions) {
  const {
    login,
    tran_key,
    mode
    } = accountOptions;

  return new AuthNetAPI({
    API_LOGIN_ID: login,
    TRANSACTION_KEY: tran_key,
    testMode: !mode
  });
}

function priorAuthCaptureTransaction(transId, amount, service) {
  const body = {
    transactionType: "priorAuthCaptureTransaction",
    amount: amount,
    refTransId: transId
  };
  // This call returns a Promise to the cb so we need to use Promise.await
  const transactionRequest = service.sendTransactionRequest.call(service, body, function (trans) {
    return trans;
  });
  return Promise.await(transactionRequest);
}

function voidTransaction(transId, service) {
  const body = {
    transactionType: "voidTransaction",
    refTransId: transId
  };
  // This call returns a Promise to the cb so we need to use Promise.await
  const transactionRequest = service.sendTransactionRequest.call(service, body, function (trans) {
    return trans;
  });
  return Promise.await(transactionRequest);
}

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
