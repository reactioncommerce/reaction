import Random from "@reactioncommerce/random";

const METHOD = "credit";
const PACKAGE_NAME = "reaction-stripe";
const PAYMENT_METHOD_NAME = "stripe_card";
const PROCESSOR = "Stripe";

// Stripe risk levels mapped to Reaction risk levels
const riskLevelMap = {
  elevated: "elevated",
  highest: "high"
};

/**
 * @summary Given a fulfillment group, returns a Stripe shipping object if it has a
 *   shipping address set on it. Otherwise returns null.
 * @param {Object} group A fulfillment group object matching Reaction's cart schema
 * @returns {Object|null} The `shipping` object.
 */
function getStripeShippingObjectForFulfillmentGroup(group) {
  if (group.type !== "shipping") return null;

  const { address } = group;
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
 * @param {String} [stripeAccountId] To charge a different Stripe account, using Stripe Connect, pass the account ID
 * @param {Number} [applicationFee] If you provided stripeAccountId, you may optionally also set an application fee
 *   for this charge, which should be as a percent, e.g., 1 to charge a fee of 1% of the subtotal.
 */
export default async function createSingleCharge(stripe, group, stripeCustomerId, currencyCode, billingAddress, stripeAccountId, applicationFee) {
  const stripeChargeInput = {
    // "A positive integer representing how much to charge, in the smallest currency unit (e.g., 100 cents to charge $1.00, or 100 to charge ¥100, a zero-decimal currency)"
    amount: Math.round(group.invoice.total * 100),
    // "When false, the charge issues an authorization (or pre-authorization), and will need to be captured later. Uncaptured charges expire in seven days."
    capture: false,
    // "Three-letter ISO currency code, in lowercase. Must be a supported currency."
    currency: currencyCode.toLowerCase(),
    // "Shipping information for the charge. Helps prevent fraud on charges for physical goods."
    shipping: getStripeShippingObjectForFulfillmentGroup(group)
  };

  const stripeOptions = {};

  if (stripeAccountId) {
    // If this is a merchant shop, we need to tokenize the customer and charge the token with the merchant ID
    stripeOptions.stripe_account = stripeAccountId; // eslint-disable-line camelcase

    // Create token from our customer object to use with merchant shop
    const customerToken = await stripe.tokens.create({ customer: stripeCustomerId }, stripeOptions);
    stripeChargeInput.source = customerToken.id;

    // Convert application fee percent to ratio
    const feeRatio = (applicationFee || 0) / 100;
    const fee = group.invoice.subtotal * feeRatio;

    // Stripe uses a "Decimal-less" format so 10.00 becomes 1000
    stripeChargeInput.application_fee = Math.round(fee * 100); // eslint-disable-line camelcase
  } else {
    // This customer's default card will be charged
    stripeChargeInput.customer = stripeCustomerId;
  }

  // https://stripe.com/docs/api#create_charge
  const charge = await stripe.charges.create(stripeChargeInput, stripeOptions);

  return {
    _id: Random.id(),
    address: billingAddress,
    amount: charge.amount / 100,
    cardBrand: charge.source.brand,
    createdAt: new Date(charge.created * 1000), // convert S to MS
    data: {
      chargeId: charge.id,
      charge,
      gqlType: "StripeCardPaymentData" // GraphQL union resolver uses this
    },
    displayName: `${charge.source.brand} ${charge.source.last4}`,
    invoice: group.invoice,
    method: METHOD,
    mode: "authorize",
    name: PAYMENT_METHOD_NAME,
    paymentPluginName: PACKAGE_NAME,
    processor: PROCESSOR,
    riskLevel: riskLevelMap[charge.outcome && charge.outcome.risk_level] || "normal",
    shopId: group.shopId,
    status: "created",
    transactionId: charge.id,
    transactions: [charge]
  };
}
