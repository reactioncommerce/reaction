import accounting from "accounting-js";
import stripeNpm from "stripe";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Random } from "meteor/random";
import { Reaction, Logger, Hooks } from "/server/api";
import { Cart, Shops, Accounts, Packages } from "/lib/collections";
import { PaymentMethodArgument } from "/lib/collections/schemas";

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

export const utils = {};

utils.getStripeApi = function (paymentPackageId) {
  const stripePackage = Packages.findOne(paymentPackageId);
  const stripeKey = stripePackage.settings.api_key || stripePackage.settings.connectAuth.access_token;
  return stripeKey;
};

/**
 * @summary Capture the results of a previous charge
 * @param {object} paymentMethod - Object containing info about the previous transaction
 * @returns {object} Object indicating the result, saved = true means success
 */
function stripeCaptureCharge(paymentMethod) {
  let result;
  const captureDetails = {
    amount: formatForStripe(paymentMethod.amount)
  };


  const stripeKey = utils.getStripeApi(paymentMethod.paymentPackageId);
  const stripe = stripeNpm(stripeKey);

  try {
    const capturePromise = stripe.charges.capture(paymentMethod.transactionId, captureDetails);
    const captureResult = Promise.await(capturePromise);

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
      error
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
    throw new Meteor.Error("invalid-parameter", "normalizeStatus requires a transaction");
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
    throw new Meteor.Error("invalid-parameter", "normalizeMode requires a transaction");
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

/**
 * @method normalizeRiskLevel
 * @private
 * @summary Normalizes the risk level response of a transaction to the values defined in paymentMethod schema
 * @param  {object} transaction - The transaction that we need to normalize
 * @return {string} normalized status string - either elevated, high, or normal
 */
function normalizeRiskLevel(transaction) {
  if (!transaction) {
    throw new Meteor.Error("invalid-parameter", "normalizeRiskLevel requires a transaction");
  }

  const outcome = transaction.outcome && transaction.outcome.risk_level;

  if (outcome === "elevated") {
    return "elevated";
  }

  if (outcome === "highest") {
    return "high";
  }

  // default to normal if no other flagged
  return "normal";
}


function buildPaymentMethods(options) {
  const { cardData, cartItemsByShop, transactionsByShopId } = options;
  if (!transactionsByShopId) {
    throw new Meteor.Error("invalid-parameter", "Creating a payment method log requries transaction data");
  }

  const shopIds = Object.keys(transactionsByShopId);
  const storedCard = `${cardData.type.charAt(0).toUpperCase() + cardData.type.slice(1)} ${cardData.number.slice(-4)}`;
  const paymentMethods = [];


  shopIds.forEach((shopId) => {
    if (transactionsByShopId[shopId]) {
      const cartItems = cartItemsByShop[shopId].map((item) => ({
        _id: item._id,
        productId: item.productId,
        variantId: item.variants._id,
        shopId,
        quantity: item.quantity
      }));

      // we need to grab this per shop to get the API key
      const packageData = Packages.findOne({
        name: "reaction-stripe",
        shopId
      });

      const paymentMethod = {
        processor: "Stripe",
        storedCard,
        method: "credit",
        paymentPackageId: packageData._id,
        // TODO: REVIEW WITH AARON - why is paymentSettings key important
        // and why is it just defined on the client?
        paymentSettingsKey: packageData.name.split("/").splice(-1)[0],
        transactionId: transactionsByShopId[shopId].id,
        amount: transactionsByShopId[shopId].amount * 0.01,
        status: normalizeStatus(transactionsByShopId[shopId]),
        mode: normalizeMode(transactionsByShopId[shopId]),
        riskLevel: normalizeRiskLevel(transactionsByShopId[shopId]),
        createdAt: new Date(transactionsByShopId[shopId].created),
        transactions: [],
        items: cartItems,
        shopId
      };
      paymentMethod.transactions.push(transactionsByShopId[shopId]);
      paymentMethods.push(paymentMethod);
    }
  });

  return paymentMethods;
}

export const methods = {
  async "stripe/payment/createCharges"(transactionType, cardData, cartId) {
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
      throw new Meteor.Error("not-configured", "Attempted to create multiple stripe charges, but stripe was not configured properly.");
    }

    const capture = transactionType === "capture";

    // Must have an email
    const cart = Cart.findOne({ _id: cartId });
    const customerAccount = Accounts.findOne({ _id: cart.userId });
    let customerEmail;

    if (!customerAccount || !Array.isArray(customerAccount.emails)) {
      // TODO: Is it okay to create random email here if anonymous?
      Logger.Error("cart email missing!");
      throw new Meteor.Error("invalid-parameter", "Email is required for marketplace checkouts.");
    }

    const defaultEmail = customerAccount.emails.find((email) => email.provides === "default");
    if (defaultEmail) {
      customerEmail = defaultEmail.address;
    } else if (!defaultEmail) {
      customerEmail = cart.email;
    } else {
      throw new Meteor.Error("invalid-parameter", "Customer does not have default email");
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
    const { currency } = primaryShop;

    try {
      // Creates a customer object, adds a source via the card data
      // and waits for the promise to resolve
      const customer = Promise.await(stripe.customers.create({
        email: customerEmail
      }).then((cust) => {
        const customerCard = stripe.customers.createSource(cust.id, { source: { ...card, object: "card" } });
        return customerCard;
      }));

      // Get cart totals for each Shop
      const cartTotals = cart.getTotalByShop();
      const cartSubtotals = cart.getSubtotalByShop();

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
          capture,
          currency
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
            shopId,
            name: "reaction-stripe"
          });

          // If this merchant doesn't have stripe setup, fail.
          // We should _never_ get to this point, because
          // this will not roll back the entire transaction
          if (!merchantStripePkg ||
            !merchantStripePkg.settings ||
            !merchantStripePkg.settings.connectAuth ||
            !merchantStripePkg.settings.connectAuth.stripe_user_id) {
            throw new Meteor.Error("server-error", `Error processing payment for merchant with shopId ${shopId}`);
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

          // Get the set application fee from the dashboard
          const dashboardAppFee = stripePkg.settings.applicationFee || 0;
          const percentAppFee = dashboardAppFee / 100; // Convert whole number app fee to percentage

          // Initialize applicationFee - this can be adjusted by the onCalculateStripeApplicationFee event hook
          const coreApplicationFee = formatForStripe(cartSubtotals[shopId] * percentAppFee);

          /**
           * Hook for affecting the application fee charged. Any hooks that `add` "onCalculateStripeApplicationFee" will
           * run here
           * @module hooks/payments/stripe
           * @method onCalculateStripeApplicationFee
           * @param {number} applicationFee the exact application fee in cents (must be returned by every hook)
           * @param {object} options object containing properties passed into the hook
           * @param {object} options.cart the cart object
           * @param {object} options.shopId the shopId
           * @todo Consider abstracting the application fee out of the Stripe implementation, into core payments
           * @returns {number} the application fee after having been through all hooks (must be returned by ever hook)
           */
          const applicationFee = Hooks.Events.run("onCalculateStripeApplicationFee", coreApplicationFee, {
            cart, // The cart
            shopId // currentShopId
          });

          // TODO: Consider discounts when determining application fee

          // Charge the application fee created by hooks. If it doesn't exist, that means that a hook has fouled up
          // the application fee. Review hooks and plugins.
          // Fall back to the application fee that comes from the stripe dashboard when hook based app fee is undefined
          // eslint-disable-next-line camelcase
          stripeCharge.application_fee = applicationFee || coreApplicationFee;
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
      Logger.error(`Received unexpected error type: ${error.rawType}`);
      Logger.error(error);
      throw new Meteor.Error("server-error", "An unexpected error occurred while creating multiple stripe charges");
    }
  },
  /**
   * Capture a Stripe charge
   * @see https://stripe.com/docs/api#capture_charge
   * @param  {Object} paymentMethod A PaymentMethod object
   * @return {Object} results from Stripe normalized
   */
  "stripe/payment/capture"(paymentMethod) {
    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

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
  "stripe/refund/create"(paymentMethod, amount, reason = "requested_by_customer") {
    check(amount, Number);
    check(reason, String);

    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

    let result;
    try {
      const stripeKey = utils.getStripeApi(paymentMethod.paymentPackageId);
      const stripe = stripeNpm(stripeKey);
      const refundPromise = stripe.refunds.create({ charge: paymentMethod.transactionId, amount: formatForStripe(amount) });
      const refundResult = Promise.await(refundPromise);
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
      Logger.fatal("Stripe call failed, refund was not issued", error.message);
    }
    return result;
  },

  /**
   * List refunds
   * @param  {Object} paymentMethod object
   * @return {Object} result
   */
  "stripe/refund/list"(paymentMethod) {
    // Call both check and validate because by calling `clean`, the audit pkg
    // thinks that we haven't checked paymentMethod arg
    check(paymentMethod, Object);
    PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

    const stripeKey = utils.getStripeApi(paymentMethod.paymentPackageId);
    const stripe = stripeNpm(stripeKey);
    let refundListResults;
    try {
      const refundListPromise = stripe.refunds.list({ charge: paymentMethod.transactionId });
      refundListResults = Promise.await(refundListPromise);
    } catch (error) {
      Logger.error("Encountered an error when trying to list refunds", error.message);
    }

    const result = [];
    if (refundListResults && refundListResults.data) {
      for (const refund of refundListResults.data) {
        result.push({
          type: refund.object,
          amount: refund.amount / 100,
          created: refund.created * 1000,
          currency: refund.currency,
          raw: refund
        });
      }
    }
    return result;
  }
};

Meteor.methods(methods);
