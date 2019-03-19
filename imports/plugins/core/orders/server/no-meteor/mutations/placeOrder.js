import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";
import appEvents from "/imports/node-app/core/util/appEvents";
import { Order as OrderSchema, Payment as PaymentSchema } from "/imports/collections/schemas";
import getDiscountsTotalForCart from "/imports/plugins/core/discounts/server/no-meteor/util/getDiscountsTotalForCart";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/payments/server/no-meteor/registration";
import buildOrderFulfillmentGroupFromInput from "../util/buildOrderFulfillmentGroupFromInput";
import verifyPaymentsMatchOrderTotal from "../../util/verifyPaymentsMatchOrderTotal";
import { orderInputSchema, paymentInputSchema } from "../simpleSchemas";

const inputSchema = new SimpleSchema({
  "order": orderInputSchema,
  "payments": {
    type: Array,
    optional: true
  },
  "payments.$": paymentInputSchema
});

/**
 * @summary Gets currency rates from a shop
 * @param {Object} collections Map of MongoDB collections
 * @param {String} shopId The ID of the shop to get rates from
 * @param {String} currencyCode The currency code
 * @returns {Number|null} The rate, or `null` if there isn't one.
 */
async function getCurrencyRates(collections, shopId, currencyCode) {
  const shop = await collections.Shops.findOne({ _id: shopId }, {
    projection: {
      [`currencies.${currencyCode}.rate`]: 1
    }
  });

  return typeof shop.currencies[currencyCode].rate === "number" ? shop.currencies[currencyCode].rate : null;
}

/**
 * @summary Gets an object representing the exchange rate at the time of an order
 * @param {Object} collections Map of MongoDB collections
 * @param {String} cartCurrencyCode The currency code of the cart
 * @param {String} shopId The ID of the shop that owns the order
 * @param {Object} [account] Current account for this request, if there is one
 * @returns {Object} Object with `userCurrency` and `exchangeRate` properties
 */
async function getCurrencyExchangeObject(collections, cartCurrencyCode, shopId, account) {
  // If user currency === shop currency, exchange rate = 1.0
  let userCurrency = cartCurrencyCode;
  let exchangeRate = 1;

  if (account && account.profile && account.profile.currency) {
    userCurrency = account.profile.currency;

    if (userCurrency !== cartCurrencyCode) {
      exchangeRate = await getCurrencyRates(collections, shopId, userCurrency);
    }
  }

  return {
    exchangeRate,
    userCurrency
  };
}

/**
 * @summary Create all authorized payments for a potential order
 * @param {String} [accountId] The ID of the account placing the order
 * @param {Object} [billingAddress] Billing address for the order as a whole
 * @param {Object} context - The application context
 * @param {String} currencyCode Currency code for interpreting the amount of all payments
 * @param {Object} currencyExchangeInfo Currency exchange info
 * @param {String} email Email address for the order
 * @param {Number} orderTotal Total due for the order
 * @param {Object[]} paymentsInput List of payment inputs
 * @param {Object} [shippingAddress] Shipping address, if relevant, for fraud detection
 * @param {String} shopId ID of shop that owns the order
 * @returns {Object[]} Array of created payments
 */
async function createPayments({
  accountId,
  billingAddress,
  context,
  currencyCode,
  currencyExchangeInfo,
  email,
  orderTotal,
  paymentsInput,
  shippingAddress,
  shopId
}) {
  // Get the shop, for determining which payment methods are enabled
  const shop = await context.queries.shopById(context, shopId);
  if (!shop) throw new ReactionError("not-found", "Shop not found");
  const availablePaymentMethods = shop.availablePaymentMethods || [];

  // Verify that total of payment inputs equals total due. We need to be sure
  // to do this before creating any payment authorizations
  verifyPaymentsMatchOrderTotal(paymentsInput || [], orderTotal);

  // Create authorized payments for each
  const paymentPromises = (paymentsInput || []).map(async (paymentInput) => {
    const { amount, method: methodName } = paymentInput;

    // Verify that this payment method is enabled for the shop
    if (!availablePaymentMethods.includes(methodName)) {
      throw new ReactionError("payment-failed", `Payment method not enabled for this shop: ${methodName}`);
    }

    // Grab config for this payment method
    let paymentMethodConfig;
    try {
      paymentMethodConfig = getPaymentMethodConfigByName(methodName);
    } catch (error) {
      Logger.error(error);
      throw new ReactionError("payment-failed", `Invalid payment method name: ${methodName}`);
    }

    // Authorize this payment
    const payment = await paymentMethodConfig.functions.createAuthorizedPayment(context, {
      accountId, // optional
      amount,
      billingAddress: paymentInput.billingAddress || billingAddress,
      currencyCode,
      email,
      shippingAddress, // optional, for fraud detection, the first shipping address if shipping to multiple
      shopId,
      paymentData: {
        ...(paymentInput.data || {})
      } // optional, object, blackbox
    });

    const paymentWithCurrency = { ...payment, currency: currencyExchangeInfo, currencyCode };

    PaymentSchema.validate(paymentWithCurrency);

    return paymentWithCurrency;
  });

  let payments;
  try {
    payments = await Promise.all(paymentPromises);
    payments = payments.filter((payment) => !!payment); // remove nulls
  } catch (error) {
    Logger.error("createOrder: error creating payments", error.message);
    throw new ReactionError("payment-failed", `There was a problem authorizing this payment: ${error.message}`);
  }

  return payments;
}

/**
 * @method placeOrder
 * @summary Places an order, authorizing all payments first
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `order` property containing the created order
 */
export default async function placeOrder(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { order: orderInput, payments: paymentsInput } = cleanedInput;
  const {
    billingAddress,
    cartId,
    currencyCode,
    customFields: customFieldsFromClient,
    email,
    fulfillmentGroups,
    shopId
  } = orderInput;
  const { accountId, account, collections, getFunctionsOfType, userId } = context;
  const { Orders, Cart } = collections;

  // We are mixing concerns a bit here for now. This is for backwards compatibility with current
  // discount codes feature. We are planning to revamp discounts soon, but until then, we'll look up
  // any discounts on the related cart here.
  let discounts = [];
  let discountTotal = 0;
  if (cartId) {
    const discountsResult = await getDiscountsTotalForCart(context, cartId);
    ({ discounts } = discountsResult);
    discountTotal = discountsResult.total;
  }

  // Create array for surcharges to apply to order, if applicable
  // Array is populated inside `fulfillmentGroups.map()`
  const orderSurcharges = [];

  // Create orderId
  const orderId = Random.id();


  // Add more props to each fulfillment group, and validate/build the items in each group
  let orderTotal = 0;
  let shippingAddressForPayments = null;
  const finalFulfillmentGroups = await Promise.all(fulfillmentGroups.map(async (inputGroup) => {
    const { group, groupSurcharges } = await buildOrderFulfillmentGroupFromInput(context, {
      billingAddress,
      cartId,
      currencyCode,
      discountTotal,
      inputGroup,
      orderId
    });

    // We save off the first shipping address found, for passing to payment services. They use this
    // for fraud detection.
    if (group.address && !shippingAddressForPayments) shippingAddressForPayments = group.address;

    // Push all group surcharges to overall order surcharge array.
    // Currently, we do not save surcharges per group
    orderSurcharges.push(...groupSurcharges);

    // Add the group total to the order total
    orderTotal += group.invoice.total;

    return group;
  }));

  const currencyExchangeInfo = await getCurrencyExchangeObject(collections, currencyCode, shopId, account);

  const payments = await createPayments({
    accountId,
    billingAddress,
    context,
    currencyCode,
    currencyExchangeInfo,
    email,
    orderTotal,
    paymentsInput,
    shippingAddress: shippingAddressForPayments,
    shopId
  });

  // Create anonymousAccessToken if no account ID
  const anonymousAccessToken = accountId ? null : Random.secret();

  const now = new Date();

  const order = {
    _id: orderId,
    accountId,
    anonymousAccessToken: anonymousAccessToken && hashLoginToken(anonymousAccessToken),
    billingAddress,
    cartId,
    createdAt: now,
    currencyCode,
    discounts,
    email,
    payments,
    shipping: finalFulfillmentGroups,
    shopId,
    surcharges: orderSurcharges,
    totalItemQuantity: finalFulfillmentGroups.reduce((sum, group) => sum + group.totalItemQuantity, 0),
    updatedAt: now,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  };

  let referenceId;
  // Grabbing cart to get the cart.referenceId. It's a shame since we are fetch cart twice before
  const cart = await Cart.findOne({ _id: cartId }, { _id: 0, referenceId: 1});
  const createReferenceIdFunctions = getFunctionsOfType("createOrderReferenceId");
  if (!createReferenceIdFunctions || createReferenceIdFunctions.length === 0) {
    // if the cart has a reference Id, and no custom function is created use that
    if (cart.referenceId) {
      referenceId = cart.referenceId;
    } else {
      referenceId = Random.id();
    }
  } else {
    referenceId = createReferenceIdFunctions[0](cart, order);
    if (createReferenceIdFunctions.length > 1) {
      Logger.warn("More than one createOrderReferenceId function defined. Using first one defined");
    }
  }

  order.referenceId = referenceId;


  // Apply custom order data transformations from plugins
  const transformCustomOrderFieldsFuncs = getFunctionsOfType("transformCustomOrderFields");
  if (transformCustomOrderFieldsFuncs.length > 0) {
    let customFields = { ...(customFieldsFromClient || {}) };
    // We need to run each of these functions in a series, rather than in parallel, because
    // each function expects to get the result of the previous. It is recommended to disable `no-await-in-loop`
    // eslint rules when the output of one iteration might be used as input in another iteration, such as this case here.
    // See https://eslint.org/docs/rules/no-await-in-loop#when-not-to-use-it
    for (const transformCustomOrderFieldsFunc of transformCustomOrderFieldsFuncs) {
      customFields = await transformCustomOrderFieldsFunc({ context, customFields, order }); // eslint-disable-line no-await-in-loop
    }
    order.customFields = customFields;
  } else {
    order.customFields = customFieldsFromClient;
  }

  // Validate and save
  OrderSchema.validate(order);
  await Orders.insertOne(order);

  await appEvents.emit("afterOrderCreate", { createdBy: userId, order });

  return {
    orders: [order],
    token: anonymousAccessToken
  };
}
