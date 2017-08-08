import accounting from "accounting-js";
import stripeNpm from "stripe";
/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
// reaction modules
import { Reaction, Logger } from "/server/api";
import { StripeApi } from "./stripeapi";

import { Cart, Shops, Accounts, Packages } from "/lib/collections";

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

/**
 * normalizes the status of a transaction
 * @method normalizeStatus
 * @param  {object} transaction - The transaction that we need to normalize
 * @return {string} normalized status string - either failed, settled, or created
 */
function normalizeStatus(transaction) {
  if (!transaction) {
    throw new Meteor.Error("normalizeStatus requires a transaction");
  }

  // if this transaction failed, mode is "failed"
  if (transaction.failure_code) {
    return "failed";
  }

  // if this transaction was captured, status is "settled"
  if (transaction.captured) { // Transaction was authorized but not captured
    return "settled";
  }

  // Otherwise status is "created"
  return "created";
}

/**
 * normalizes the mode of a transaction
 * @method normalizeMode
 * @param  {object} transaction The transaction that we need to normalize
 * @return {string} normalized status string - either failed, capture, or authorize
 */
function normalizeMode(transaction) {
  if (!transaction) {
    throw new Meteor.Error("normalizeMode requires a transaction");
  }

  // if this transaction failed, mode is "failed"
  if (transaction.failure_code) {
    return "failed";
  }

  // If this transaction was captured, mode is "capture"
  if (transaction.captured) {
    return "capture";
  }

  // Anything else, mode is "authorize"
  return "authorize";
}


function buildPaymentMethods(options) {
  const { cardData, transactions } = options;
  if (!transactions) {
    throw new Meteor.Error("Creating a payment method log requries transaction data");
  }

  const shopIds = Object.keys(transactions);
  const storedCard = cardData.type.charAt(0).toUpperCase() + cardData.type.slice(1) + " " + cardData.number.slice(-4);
  const packageData = Packages.findOne({
    name: "reaction-stripe",
    shopId: Reaction.getPrimaryShopId()
  });

  const paymentMethods = [];

  shopIds.forEach((shopId) => {
    if (transactions[shopId]) {
      const paymentMethod = {
        processor: "Stripe",
        storedCard: storedCard,
        method: "credit",
        paymentPackageId: packageData._id,
        // TODO: REVIEW WITH AARON - why is paymentSettings key important
        // and why is it just defined on the client?
        paymentSettingsKey: packageData.name.split("/").splice(-1)[0],
        transactionId: transactions[shopId].id,
        amount: transactions[shopId].amount * 0.01,
        status: normalizeStatus(transactions[shopId]),
        mode: normalizeMode(transactions[shopId]),
        createdAt: new Date(transactions[shopId].created),
        transactions: []
      };
      paymentMethod.transactions.push(transactions[shopId]);
      paymentMethods.push(paymentMethod);
    }
  });

  return paymentMethods;
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

    // TODO: Add transaction fee to Stripe chargeObj when stripeConnect is in use.

    if (transactionType === "authorize") {
      chargeObj.capture = false;
    }
    chargeObj.card = parseCardData(cardData);
    chargeObj.amount = formatForStripe(paymentData.total);
    chargeObj.currency = paymentData.currency;

    // TODO: Check for a transaction fee and apply
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

  "stripe/payment/createCharges": async function (transactionType, cardData, cartId) {
    check(transactionType, String);
    check(cardData, { name: String, number: ValidCardNumber, expire_month: ValidExpireMonth, expire_year: ValidExpireYear, cvv2: ValidCVV, type: String });
    check(cartId, String);


    const stripePkg = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getPrimaryShopId(),
      name: "reaction-stripe"
    });

    const card = parseCardData(cardData);

    if (!stripePkg || !stripePkg.settings || !stripePkg.settings.api_key) {
      // Fail if we can't find a Stripe API key
      throw new Meteor.Error("Attempted to create multiple stripe charges, but stripe was not configured properly.");
    }


    // Must have an email
    const cart = Cart.findOne({ _id: cartId });
    const customerAccount = Accounts.findOne({ _id: cart.userId });
    let customerEmail;

    if (!customerAccount || !Array.isArray(customerAccount.emails)) {
      // TODO: Is it okay to create random email here if anonymous?
      Logger.Error("cart email missing!");
      throw new Meteor.Error("Email is required for marketplace checkouts.");
    }

    const defaultEmail = customerAccount.emails.find((email) => email.provides === "default");
    if (defaultEmail) {
      customerEmail = defaultEmail.address;
    } else {
      throw new Meteor.Error("Customer does not have default email");
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


    const transactionsByShopId = {};

    // TODO: If there is only one transactionsByShopId and the shopId is primaryShopId -
    // Create a standard charge and bypass creating a customer for this charge
    const primaryShop = Shops.findOne({ _id: Reaction.getPrimaryShopId() });
    const currency = primaryShop.currency;


    try {
      // Creates a customer object, adds a source via the card data
      // and waits for the promise to resolve
      const customer = Promise.await(stripe.customers.create({
        email: customerEmail
      }).then(function (cust) {
        const customerCard = stripe.customers.createSource(cust.id, { source: { ...card, object: "card" } });
        return customerCard;
      }));

      // Get cart totals for each Shop
      const cartTotals = cart.cartTotalByShop();

      // Loop through all shopIds represented in cart
      shopIds.forEach((shopId) => {
        // TODO: If shopId is primaryShopId - create a non-connect charge with the
        // stripe customer object

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

        // TODO: Add connect application fee to this charge
        // Charge the token we just created
        const charge = Promise.await(stripe.charges.create({
          amount: formatForStripe(cartTotals[shopId]),
          currency: currency,
          source: token.id
        }, {
          stripe_account: stripeAccount
        }));


        transactionsByShopId[shopId] = charge;
      });

      // If successful, call cart/submitPayment and return success back to client.
      const paymentMethods = buildPaymentMethods({ cardData, transactions: transactionsByShopId });
      Meteor.call("cart/submitPayment", paymentMethods, transactionsByShopId);


      // TODO: Make sure that stripe is throwing errors properly to client
      // If unsuccessful, return censored failure back to client

      return transactionsByShopId;
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

    // XXX: EXPIRIMENTAL UPDATE to `stripe/refunds/list` WIP
    const stripePkg = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getPrimaryShopId(),
      name: "reaction-stripe"
    });

    if (!stripePkg || !stripePkg.settings || !stripePkg.settings.api_key) {
      // Fail if we can't find a Stripe API key
      throw new Meteor.Error("Attempted to list stripe refunds, but stripe was not configured properly.");
    }

    // Initialize stripe api lib
    const stripeApiKey = stripePkg.settings.api_key;
    const stripe = stripeNpm(stripeApiKey);

    try {
      const refunds = Promise.await(stripe.refunds.list({
        charge: paymentMethod.transactionId
      }));

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
