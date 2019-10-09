import Random from "@reactioncommerce/random";
import { STRIPE_PACKAGE_NAME } from "./constants.js";
import getStripeInstanceForShop from "./getStripeInstanceForShop.js";

const METHOD = "credit";
const PAYMENT_METHOD_NAME = "stripe_card";

// NOTE: The "processor" value is lowercased and then prefixed to various payment Meteor method names,
// so for example, if this is "Stripe", the list refunds method is expected to be named "stripe/refund/list"
const PROCESSOR = "Stripe";

// Stripe risk levels mapped to Reaction risk levels
const riskLevelMap = {
  elevated: "elevated",
  highest: "high"
};

/**
 * @summary Given a Reaction shipping address, returns a Stripe shipping object. Otherwise returns null.
 * @param {Object} address The shipping address
 * @returns {Object|null} The `shipping` object.
 */
function getStripeShippingObject(address) {
  if (!address) return null;

  return {
    address: {
      city: address.city,
      country: address.country,
      line1: address.address1,
      line2: address.address2,
      postal_code: address.postal, // eslint-disable-line camelcase
      state: address.region
    },
    name: address.fullName,
    phone: address.phone
  };
}

/**
 * Creates a Stripe charge for a single fulfillment group
 * @param {Object} context The request context
 * @param {Object} input Input necessary to create a payment
 * @returns {Object} The payment object in schema expected by the orders plugin
 */
export default async function stripeCreateAuthorizedPayment(context, input) {
  const {
    accountId,
    amount,
    billingAddress,
    currencyCode,
    email,
    shippingAddress,
    shopId,
    paymentData: {
      stripeTokenId
    }
  } = input;

  const stripe = await getStripeInstanceForShop(context, shopId);

  // For orders with only a single fulfillment group, we could create a charge directly from the card token, and skip
  // creating a customer. However, to help make future charging easier and because we always have an email address and tracking
  // payments by customer in Stripe can be useful, we create a customer no matter what.
  const stripeCustomer = await stripe.customers.create({ email, metadata: { accountId }, source: stripeTokenId });
  const stripeCustomerId = stripeCustomer.id;

  // https://stripe.com/docs/api#create_charge
  const charge = await stripe.charges.create({
    // "A positive integer representing how much to charge, in the smallest currency unit (e.g., 100 cents to charge $1.00, or 100 to charge ¥100, a zero-decimal currency)"
    amount: Math.round(amount * 100),
    // "When false, the charge issues an authorization (or pre-authorization), and will need to be captured later. Uncaptured charges expire in seven days."
    capture: false,
    // "Three-letter ISO currency code, in lowercase. Must be a supported currency."
    currency: currencyCode.toLowerCase(),
    // This customer's default card will be charged
    customer: stripeCustomerId,
    // "Shipping information for the charge. Helps prevent fraud on charges for physical goods."
    shipping: getStripeShippingObject(shippingAddress)
  });

  return {
    _id: Random.id(),
    address: billingAddress,
    amount: charge.amount / 100,
    cardBrand: charge.source.brand,
    createdAt: new Date(charge.created * 1000), // convert S to MS
    data: {
      chargeId: charge.id,
      charge,
      customerId: stripeCustomerId,
      gqlType: "StripeCardPaymentData" // GraphQL union resolver uses this
    },
    displayName: `${charge.source.brand} ${charge.source.last4}`,
    method: METHOD,
    mode: "authorize",
    name: PAYMENT_METHOD_NAME,
    paymentPluginName: STRIPE_PACKAGE_NAME,
    processor: PROCESSOR,
    riskLevel: riskLevelMap[charge.outcome && charge.outcome.risk_level] || "normal",
    shopId,
    status: "created",
    transactionId: charge.id,
    transactions: [charge]
  };
}
