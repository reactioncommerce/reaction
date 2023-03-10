import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";
import verifyPaymentsMatchOrderTotal from "../verifyPaymentsMatchOrderTotal.js";
import { Payment as PaymentSchema } from "../../simpleSchemas.js";

/**
 * @summary Create all authorized payments for a potential order
 * @param {String} [accountId] The ID of the account placing the order
 * @param {Object} [billingAddress] Billing address for the order as a whole
 * @param {Object} context - The application context
 * @param {String} currencyCode Currency code for interpreting the amount of all payments
 * @param {String} email Email address for the order
 * @param {Number} orderTotal Total due for the order
 * @param {Object[]} paymentsInput List of payment inputs
 * @param {Object} [shippingAddress] Shipping address, if relevant, for fraud detection
 * @param {String} shop shop that owns the order
 * @returns {Object[]} Array of created payments
 */
export default async function createPayments({
  accountId,
  billingAddress,
  context,
  currencyCode,
  email,
  orderTotal,
  paymentsInput,
  shippingAddress,
  shop,
  mode
}) {
  // Determining which payment methods are enabled for the shop
  const availablePaymentMethods = shop.availablePaymentMethods || [];
  const createOrderMode = mode === "createOrderObject";

  // Verify that total of payment inputs equals total due. We need to be sure
  // to do this before creating any payment authorizations
  verifyPaymentsMatchOrderTotal(paymentsInput || [], orderTotal);

  // Create authorized payments for each
  const paymentPromises = (paymentsInput || []).map(async (paymentInput) => {
    const { amount, method: methodName } = paymentInput;

    // Verify that this payment method is enabled for the shop
    if (!availablePaymentMethods.includes(methodName)) {
      const errorName = "payment-failed";
      const errorMessage = `Payment method not enabled for this shop: ${methodName}`;
      const eventData = { field: "Payment Method Name", value: methodName };
      throw new ReactionError(errorName, errorMessage, eventData);
    }

    // Grab config for this payment method
    let paymentMethodConfig;
    try {
      paymentMethodConfig = context.queries.getPaymentMethodConfigByName(methodName);
    } catch (error) {
      Logger.error(error);
      const errorName = "payment-failed";
      const errorMessage = `Invalid payment method name: ${methodName}`;
      const eventData = { field: "Payment Method Name", value: methodName };
      throw new ReactionError(errorName, errorMessage, eventData);
    }

    // Authorize this payment - skip if validateOrder
    let payment = {};
    if (createOrderMode) {
      try {
        payment = await paymentMethodConfig.functions.createAuthorizedPayment(context, {
          accountId, // optional
          amount,
          billingAddress: paymentInput.billingAddress || billingAddress,
          currencyCode,
          email,
          shippingAddress, // optional, for fraud detection, the first shipping address if shipping to multiple
          shopId: shop._id,
          paymentData: {
            ...(paymentInput.data || {})
          } // optional, object, blackbox
        });
      } catch (err) {
        throw new ReactionError("payment-failed", "Error in authorizing payment");
      }
    }

    const paymentWithCurrency = {
      ...payment,
      // This is from previous support for exchange rates, which was removed in v3.0.0
      currency: { exchangeRate: 1, userCurrency: currencyCode },
      currencyCode
    };

    // If mode === validateOrder, we are not authorizing payment and we do not have payment object to validate
    if (createOrderMode) {
      PaymentSchema.validate(paymentWithCurrency);
    }

    return paymentWithCurrency;
  });

  let payments = {};
  if (createOrderMode) {
    try {
      payments = await Promise.all(paymentPromises);
      payments = payments.filter((payment) => !!payment); // remove nulls
    } catch (error) {
      Logger.error("createOrder: error creating payments", error.message);
      throw new ReactionError("payment-failed", `There was a problem authorizing this payment: ${error.message}`);
    }
  }

  return payments;
}
