import accounting from "accounting-js";
import stripeNpm from "stripe";

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Random } from "meteor/random";

import { Reaction, Logger } from "/server/api";
import { StripeApi } from "./stripeapi";

import { Cart, Shops, Accounts, Packages } from "/lib/collections";

function parseCardData(data) {
  return {
    number: data.number,
    name: data.name,
    cvc: data.cvv2,
    exp_month: data.expire_month, // eslint-disable-line camelcase
    exp_year: data.expire_year // eslint-disable-line camelcase
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
  const { cardData, cartItemsByShop, transactionsByShopId } = options;
  if (!transactionsByShopId) {
    throw new Meteor.Error("Creating a payment method log requries transaction data");
  }

  const shopIds = Object.keys(transactionsByShopId);
  const storedCard = cardData.type.charAt(0).toUpperCase() + cardData.type.slice(1) + " " + cardData.number.slice(-4);
  const packageData = Packages.findOne({
    name: "reaction-stripe",
    shopId: Reaction.getPrimaryShopId()
  });

  const paymentMethods = [];


  shopIds.forEach((shopId) => {
    if (transactionsByShopId[shopId]) {
      const cartItems = cartItemsByShop[shopId].map((item) => {
        return {
          _id: item._id,
          productId: item.productId,
          variantId: item.variants._id,
          shopId: shopId,
          quantity: item.quantity
        };
      });

      const paymentMethod = {
        processor: "Stripe",
        storedCard: storedCard,
        method: "credit",
        paymentPackageId: packageData._id,
        // TODO: REVIEW WITH AARON - why is paymentSettings key important
        // and why is it just defined on the client?
        paymentSettingsKey: packageData.name.split("/").splice(-1)[0],
        transactionId: transactionsByShopId[shopId].id,
        amount: transactionsByShopId[shopId].amount * 0.01,
        status: normalizeStatus(transactionsByShopId[shopId]),
        mode: normalizeMode(transactionsByShopId[shopId]),
        createdAt: new Date(transactionsByShopId[shopId].created),
        transactions: [],
        items: cartItems,
        shopId: shopId
      };
      paymentMethod.transactions.push(transactionsByShopId[shopId]);
      paymentMethods.push(paymentMethod);
    }
  });

  return paymentMethods;
}

export const methods = {
  "stripe/payment/createCharges": async function (transactionType, cardData, cartId) {
    check(transactionType, String);
    check(cardData, {
      name: String,
      number: String,
      expire_month: String, // eslint-disable-line camelcase
      expire_year: String, // eslint-disable-line camelcase
      cvv2: String,
      type: String
    });
    check(cartId, String);

    const primaryShopId = Reaction.getPrimaryShopId();

    const stripePkg = Reaction.getPackageSettingsWithOptions({
      shopId: primaryShopId,
      name: "reaction-stripe"
    });

    const card = parseCardData(cardData);

    if (!stripePkg || !stripePkg.settings || !stripePkg.settings.api_key) {
      // Fail if we can't find a Stripe API key
      throw new Meteor.Error("Attempted to create multiple stripe charges, but stripe was not configured properly.");
    }

    const capture = transactionType === "capture";

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
    const primaryShop = Shops.findOne({ _id: primaryShopId });
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
      const cartTotals = cart.getTotalByShop();

      // Loop through all shopIds represented in cart
      shopIds.forEach((shopId) => {
        // TODO: If shopId is primaryShopId - create a non-connect charge with the
        // stripe customer object

        const isPrimaryShop = shopId === primaryShopId;

        let merchantStripePkg;
        // Initialize options - this is where idempotency_key
        // and, if using connect, stripe_account go
        const stripeOptions = {};
        const stripeCharge = {
          amount: formatForStripe(cartTotals[shopId]),
          capture: capture,
          currency: currency
          // TODO: add product metadata to stripe charge
        };

        if (isPrimaryShop) {
          // If this is the primary shop, we can make a direct charge to the
          // customer object we just created.
          stripeCharge.customer = customer.customer;
        } else {
          // If this is a merchant shop, we need to tokenize the customer
          // and charge the token with the merchant id
          merchantStripePkg = Reaction.getPackageSettingsWithOptions({
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
          const stripeUserId = merchantStripePkg.settings.connectAuth.stripe_user_id;
          stripeOptions.stripe_account = stripeUserId; // eslint-disable-line camelcase

          // Create token from our customer object to use with merchant shop
          const token = Promise.await(stripe.tokens.create({
            customer: customer.customer
          }, stripeOptions));

          // TODO: Add description to charge in Stripe
          stripeCharge.source = token.id;

          // Demo 20% application fee
          stripeCharge.application_fee = formatForStripe(cartTotals[shopId] * 0.2); // eslint-disable-line camelcase
        }

        // We should only do this once per shop per cart
        stripeOptions.idempotency_key = `${shopId}${cart._id}${Random.id()}`; // eslint-disable-line camelcase

        // Create a charge with the options set above
        const charge = Promise.await(stripe.charges.create(stripeCharge, stripeOptions));

        transactionsByShopId[shopId] = charge;
      });


      // get cartItemsByShop to build paymentMethods
      const cartItemsByShop = cart.getItemsByShop();

      // Build paymentMethods from transactions, card data and cart items
      const paymentMethods = buildPaymentMethods({ cardData, cartItemsByShop, transactionsByShopId });

      // If successful, call cart/submitPayment and return success back to client.
      Meteor.call("cart/submitPayment", paymentMethods);
      return { success: true, transactions: transactionsByShopId };
    } catch (error) {
      // If unsuccessful
      // return failure back to client if error is a standard stripe card error
      if (error.rawType === "card_error") {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code,
            type: error.type,
            rawType: error.rawType,
            detail: error.detail
          }
        };
      }
      // If we get an unexpected error, log and return a censored error message
      Logger.error("Received unexpected error type: " + error.rawType);
      Logger.error(error);
      throw new Meteor.Error("Error creating multiple stripe charges", "An unexpected error occurred");
    }
  },

  // TODO: Update this method to support connect captures
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

  // TODO: Update this method to support connect
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

  // Update this method to support connect
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
};

Meteor.methods(methods);
