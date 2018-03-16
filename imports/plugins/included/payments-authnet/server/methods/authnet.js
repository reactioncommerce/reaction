/* eslint camelcase: 0 */
/* eslint quote-props: 0 */
// meteor modules
import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Promise } from "meteor/promise";

import AuthNetAPI from "authorize-net";
import { Reaction, Logger } from "/server/api";
import { Packages } from "/lib/collections";
import { ValidCardNumber, ValidExpireMonth, ValidExpireYear, ValidCVV } from "/lib/api";
import { PaymentMethodArgument } from "/lib/collections/schemas";

function getAccountOptions(isPayment) {
  const queryConditions = {
    name: "reaction-auth-net",
    shopId: Reaction.getShopId()
  };
  if (isPayment) {
    queryConditions.enabled = true;
  }

  const packageData = Packages.findOne(queryConditions);
  const { settings } = packageData;
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
  authnetSubmit(transactionType = "authorizeTransaction", cardInfo, paymentInfo) {
    check(transactionType, String);
    try {
      check(cardInfo, {
        cardNumber: ValidCardNumber,
        expirationYear: ValidExpireYear,
        expirationMonth: ValidExpireMonth,
        cvv2: ValidCVV
      });
    } catch (error) {
      throw new Meteor.Error("invalid-card-details", "Invalid card details");
    }
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
    const isPayment = true;
    const authnetService = getAuthnetService(getAccountOptions(isPayment));
    const authnetTransactionFunc = authnetService[transactionType];
    let authResult;
    if (authnetTransactionFunc) {
      try {
        authResult = authnetTransactionFunc.call(
          authnetService,
          order,
          creditCard
        );
      } catch (error) {
        Logger.fatal(error);
      }
    } else {
      throw new Meteor.Error("invalid-transaction-type", "Invalid Transaction Type");
    }
    try {
      const result = Promise.await(authResult);
      return result;
    } catch (error) {
      throw new Meteor.Error("auth-failed", error.message);
    }
  },

  "authnet/payment/capture"(paymentMethod) {
    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

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
        const captureResult = voidTransaction(
          transactionId,
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
          error
        };
      }
      return result;
    }
    try {
      const captureResult = priorAuthCaptureTransaction(
        transactionId,
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
        error
      };
    }
    return result;
  },

  "authnet/refund/create"(paymentMethod, amount) {
    check(amount, Number);

    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

    const result = {
      saved: false,
      error: "Reaction does not yet support direct refund processing from Authorize.net. " +
      "Please visit their web portal to perform this action. https://account.authorize.net/"
    };

    return result;
  },
  "authnet/refund/list"(...args) {
    check(args, [Match.Any]);
    Meteor.Error("not-implemented", "Authorize.net does not yet support retrieving a list of refunds.");
    return [];
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
    amount,
    refTransId: transId
  };
  // This call returns a Promise to the cb so we need to use Promise.await
  const transactionRequest = service.sendTransactionRequest.call(service, body, (trans) => trans);
  return Promise.await(transactionRequest);
}

function voidTransaction(transId, service) {
  const body = {
    transactionType: "voidTransaction",
    refTransId: transId
  };
  // This call returns a Promise to the cb so we need to use Promise.await
  const transactionRequest = service.sendTransactionRequest.call(service, body, (trans) => trans);
  return Promise.await(transactionRequest);
}
