import Random from "@reactioncommerce/random";
import getStripeInstanceForShop from "./getStripeInstanceForShop.js";

const METHOD = "credit";
const PACKAGE_NAME = "reaction-marketplace";
const PAYMENT_METHOD_NAME = "marketplace_stripe_card";

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
 * Creates a Stripe charge for a single fulfillment group.
 * This is borrowed from a similar function in the reaction-stripe package but
 * updated to handle collecting a referral fee using Stripe Connect.
 * @param {Object} context The request context
 * @param {Object} input Input necessary to create a payment
 * @returns {Object} The payment object in schema expected by the orders plugin
 */
export default async function createSingleCharge(context, input) {
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

  const { applicationFee, merchantStripeUserId, stripe } = await getStripeInstanceForShop(context, shopId);

  // For orders with only a single fulfillment group, we could create a charge directly from the card token, and skip
  // creating a customer. However, to help make future charging easier and because we always have an email address and tracking
  // payments by customer in Stripe can be useful, we create a customer no matter what.
  const stripeCustomer = await stripe.customers.create({ email, metadata: { accountId }, source: stripeTokenId });
  const stripeCustomerId = stripeCustomer.id;

  const stripeChargeInput = {
    // "A positive integer representing how much to charge, in the smallest currency unit (e.g., 100 cents to charge $1.00, or 100 to charge ¥100, a zero-decimal currency)"
    amount: Math.round(amount * 100),
    // "When false, the charge issues an authorization (or pre-authorization), and will need to be captured later. Uncaptured charges expire in seven days."
    capture: false,
    // "Three-letter ISO currency code, in lowercase. Must be a supported currency."
    currency: currencyCode.toLowerCase(),
    // "Shipping information for the charge. Helps prevent fraud on charges for physical goods."
    shipping: getStripeShippingObject(shippingAddress)
  };

  let stripeOptions;

  if (merchantStripeUserId) {
    // If this is a merchant shop, we need to tokenize the customer and charge the token with the merchant ID
    stripeOptions = { stripe_account: merchantStripeUserId }; // eslint-disable-line camelcase

    // Create token from our customer object to use with merchant shop
    const customerToken = await stripe.tokens.create({ customer: stripeCustomerId }, stripeOptions);
    stripeChargeInput.source = customerToken.id;

    // Convert application fee percent to ratio
    const feeRatio = applicationFee / 100;
    const fee = amount * feeRatio;

    // Stripe uses a "Decimal-less" format so 10.00 becomes 1000
    stripeChargeInput.application_fee = Math.round(fee * 100); // eslint-disable-line camelcase
  } else {
    // This customer's default card will be charged
    stripeChargeInput.customer = stripeCustomerId;
  }

  // https://stripe.com/docs/api#create_charge
  // The `if` may seem unnecessary, but Stripe lib is particular about passing options.
  // If you pass a second argument and it is empty or null or undefined, it throws an
  // error.
  let charge;
  if (stripeOptions) {
    charge = await stripe.charges.create(stripeChargeInput, stripeOptions);
  } else {
    charge = await stripe.charges.create(stripeChargeInput);
  }

  return {
    _id: Random.id(),
    address: billingAddress,
    amount: charge.amount / 100,
    cardBrand: charge.source.brand,
    createdAt: new Date(charge.created * 1000), // convert S to MS
    data: {
      applicationFee,
      chargeId: charge.id,
      charge,
      customerId: stripeCustomerId,
      gqlType: "MarketplaceStripeCardPaymentData" // GraphQL union resolver uses this
    },
    displayName: `${charge.source.brand} ${charge.source.last4}`,
    method: METHOD,
    mode: "authorize",
    name: PAYMENT_METHOD_NAME,
    paymentPluginName: PACKAGE_NAME,
    processor: PROCESSOR,
    riskLevel: riskLevelMap[charge.outcome && charge.outcome.risk_level] || "normal",
    shopId,
    status: "created",
    transactionId: charge.id,
    transactions: [charge]
  };
}
