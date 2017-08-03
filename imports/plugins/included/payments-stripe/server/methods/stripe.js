import accounting from "accounting-js";
import stripeNpm from "stripe";
/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
// reaction modules
import { Reaction, Logger } from "/server/api";
import { StripeApi } from "./stripeapi";

import { Cart } from "/lib/collections";

function luhnValid(x) {
  return [...x].reverse().reduce((sum, c, i) => {
    let d = parseInt(c, 10);
    if (i % 2 !== 0) { d *= 2; }
    if (d > 9) { d -= 9; }
    return sum + d;
  }, 0) % 10 === 0;
}

const ValidCardNumber = Match.Where(function (x) {
  return /^[0-9]{13,16}$/.test(x) && luhnValid(x);
});

const ValidExpireMonth = Match.Where(function (x) {
  return /^[0-9]{1,2}$/.test(x);
});

const ValidExpireYear = Match.Where(function (x) {
  return /^[0-9]{4}$/.test(x);
});

const ValidCVV = Match.Where(function (x) {
  return /^[0-9]{3,4}$/.test(x);
});

function parseCardData(data) {
  return {
    number: data.number,
    name: data.name,
    cvc: data.cvv2,
    exp_month: data.expire_month,
    exp_year: data.expire_year
  };
}

// Stripe uses a "Decimal-less" format so 10.00 becomes 1000
function formatForStripe(amount) {
  return Math.round(amount * 100);
}
function unformatFromStripe(amount) {
  return (amount / 100);
}

function stripeCaptureCharge(paymentMethod) {
  let result;
  const captureDetails = {
    amount: formatForStripe(paymentMethod.amount)
  };

  try {
    const captureResult = StripeApi.methods.captureCharge.call({
      transactionId: paymentMethod.transactionId,
      captureDetails: captureDetails
    });
    if (captureResult.status === "succeeded") {
      result = {
        saved: true,
        response: captureResult
      };
    } else {
      result = {
        saved: false,
        response: captureResult
      };
    }
  } catch (error) {
    Logger.error(error);
    result = {
      saved: false,
      error: error
    };
    return { error, result };
  }
  return result;
}


Meteor.methods({
  "stripeSubmit": function (transactionType, cardData, paymentData) {
    check(transactionType, String);
    check(cardData, {
      name: String,
      number: ValidCardNumber,
      expire_month: ValidExpireMonth,
      expire_year: ValidExpireYear,
      cvv2: ValidCVV,
      type: String
    });
    check(paymentData, {
      total: String,
      currency: String
      // Commenting this out because it causes tests to fail and isn't fully implemented.
      // shopId: String // TODO: Implement Marketplace Payment - perhaps including shopId
    });

    const chargeObj = {
      amount: "",
      currency: "",
      card: {},
      capture: true
    };

    // check if this is a seller shop for destination and transaction fee logic
    // TODO: Add transaction fee to Stripe chargeObj when stripeConnect is in use.

    // Where is sellerShops coming from here?
    // const sellerShop = sellerShops.findOne(paymentData.shopId);
    //
    // if (sellerShop && sellerShop.stripeConnectSettings) {
    //   const chargeObj = {
    //     chargeData: {
    //       amount: "",
    //       currency: "",
    //       transactionFee: 0,
    //       card: {},
    //       capture: true
    //     },
    //     stripe_account: sellerShop.stripeConnectSettings.stripe_user_id
    //   };
    // } else {
    //   const chargeObj = {
    //     amount: "",
    //     currency: "",
    //     card: {},
    //     capture: true
    //   };
    // }

    if (transactionType === "authorize") {
      chargeObj.capture = false;
    }
    chargeObj.card = parseCardData(cardData);
    chargeObj.amount = formatForStripe(paymentData.total);
    chargeObj.currency = paymentData.currency;

    // TODO: Check for a transaction fee and apply
    // const stripeConnectSettings = Reaction.getPackageSettings("reaction-stripe-connect").settings;
    // if (sellerShop.stripeConnectSettings && stripeConnectSettings.transactionFee.enabled) {
    //   chargeObj.transactionFee = chargeObj.amount * stripeConnectSettings.transactionFee.percentage;
    // }

    let result;
    let chargeResult;

    try {
      chargeResult = StripeApi.methods.createCharge.call({ chargeObj });
      if (chargeResult && chargeResult.status && chargeResult.status === "succeeded") {
        result = {
          saved: true,
          response: chargeResult
        };
      } else {
        Logger.error("Stripe Call succeeded but charge failed");
        result = {
          saved: false,
          error: chargeResult.error
        };
      }
      return result;
    } catch (e) {
      Logger.error(e);
      throw new Meteor.Error("error", e.message);
    }
  },

  "stripe/payment/createMultipleCharges": function (transactionType, cardData, cartId, currency) {
    check(transactionType, String);
    check(cardData, { name: String, number: ValidCardNumber, expire_month: ValidExpireMonth, expire_year: ValidExpireYear, cvv2: ValidCVV, type: String });
    check(cartId, String);
    check(currency, String);

    const stripePkg = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getPrimaryShopId(),
      name: "reaction-stripe"
    });

    const card = parseCardData(cardData);

    if (!stripePkg || !stripePkg.settings || !stripePkg.settings.api_key) {
      // Fail if we can't find a Stripe API key
      throw new Meteor.Error("Attempted to create multiple stripe charges, but stripe was not configured properly.");
    }

    const cart = Cart.findOne({ _id: cartId });
    if (cart) {
      cart.email = "test@example.com";
    }

    if (!cart.email) {
      // TODO: Is it okay to create random email here if anonymous?
      throw new Meteor.Error("Email is required for marketplace checkouts.");
    }

    // Initialize stripe api lib
    const stripeApiKey = stripePkg.settings.api_key;
    const stripe = stripeNpm(stripeApiKey);


    // get array of shopIds that exist in this cart
    const shopIds = cart.items.reduce((uniqueShopIds, item) => {
      if (uniqueShopIds.indexOf(item.shopId) === -1) {
        uniqueShopIds.push(item.shopId);
      }
      return uniqueShopIds;
    }, []);

    const chargesByShopId = {};

    try {
      // Creates a customer object, adds a source via the card data
      // and waits for the promise to resolve
      const customer = Promise.await(stripe.customers.create({
        email: cart.email
      }).then(function (cust) {
        return stripe.customers.createSource(cust.id, { source: { ...card, object: "card" } });
      }));

      // Get cart totals for each Shop
      const cartTotals = cart.cartTotalByShop();

      // Loop through all shopIds represented in cart
      shopIds.forEach((shopId) => {
        // get stripe package for this shopId
        const merchantStripePkg = Reaction.getPackageSettingsWithOptions({
          shopId: shopId,
          name: "reaction-stripe"
        });

        // If this merchant doesn't have stripe setup, fail.
        // We should _never_ get to this point, because
        // this will not roll back the entire transaction
        if (!merchantStripePkg ||
            !merchantStripePkg.settings ||
            !merchantStripePkg.settings.connectAuth ||
            !merchantStripePkg.settings.connectAuth.stripe_user_id) {
          throw new Meteor.Error(`Error processing payment for merchant with shopId ${shopId}`);
        }

        // get stripe account for this shop
        const stripeAccount = merchantStripePkg.settings.connectAuth.stripe_user_id;

        // Create token from our customer object to use with merchant shop
        const token = Promise.await(stripe.tokens.create({
          customer: customer.customer
        }, {
          stripe_account: stripeAccount
        }));

        // Charge the token we just created
        const charge = Promise.await(stripe.charges.create({
          amount: formatForStripe(cartTotals[shopId]),
          currency: currency,
          source: token.id
        }, {
          stripe_account: stripeAccount
        }));

        chargesByShopId[shopId] = charge;
      });
    } catch (error) {
      throw new Meteor.Error("Error creating multiple stripe charges", error);
    }
  },


  /**
   * Capture a Stripe charge
   * @see https://stripe.com/docs/api#capture_charge
   * @param  {Object} paymentMethod A PaymentMethod object
   * @return {Object} results from Stripe normalized
   */
  "stripe/payment/capture": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    // let result;
    const captureDetails = {
      amount: formatForStripe(paymentMethod.amount)
    };

    // 100% discounts are not valid when using Stripe
    // If discount is 100%, capture 100% and then refund 100% of transaction
    if (captureDetails.amount === accounting.unformat(0)) {
      const voidedAmount = unformatFromStripe(paymentMethod.transactions[0].amount);
      stripeCaptureCharge(paymentMethod);

      return Meteor.call("stripe/refund/create", paymentMethod, voidedAmount);
    }
    return stripeCaptureCharge(paymentMethod);
  },

  /**
   * Issue a refund against a previously captured transaction
   * @see https://stripe.com/docs/api#refunds
   * @param  {Object} paymentMethod object
   * @param  {Number} amount to be refunded
   * @param  {String} reason refund was issued (currently unused by client)
   * @return {Object} result
   */
  "stripe/refund/create": function (paymentMethod, amount, reason = "requested_by_customer") {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    check(amount, Number);
    check(reason, String);

    const refundDetails = {
      charge: paymentMethod.transactionId,
      amount: formatForStripe(amount),
      reason
    };

    let result;
    try {
      const refundResult = StripeApi.methods.createRefund.call({ refundDetails });
      Logger.debug(refundResult);
      if (refundResult && refundResult.object === "refund") {
        result = {
          saved: true,
          response: refundResult
        };
      } else {
        result = {
          saved: false,
          response: refundResult
        };
        Logger.warn("Stripe call succeeded but refund not issued");
      }
    } catch (error) {
      Logger.error(error);
      result = {
        saved: false,
        error: `Cannot issue refund: ${error.message}`
      };
      Logger.fatal("Stripe call failed, refund was not issued");
    }
    return result;
  },

  /**
   * List refunds
   * @param  {Object} paymentMethod object
   * @return {Object} result
   */
  "stripe/refund/list": function (paymentMethod) {
    check(paymentMethod, Reaction.Schemas.PaymentMethod);
    let result;
    try {
      const refunds = StripeApi.methods.listRefunds.call({ transactionId: paymentMethod.transactionId });
      result = [];
      for (const refund of refunds.data) {
        result.push({
          type: refund.object,
          amount: refund.amount / 100,
          created: refund.created * 1000,
          currency: refund.currency,
          raw: refund
        });
      }
    } catch (error) {
      Logger.error(error);
      result = { error };
    }
    return result;
  }
});
