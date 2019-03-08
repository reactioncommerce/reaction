import accounting from "accounting-js";
import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";
import appEvents from "/imports/node-app/core/util/appEvents";
import { Order as OrderSchema, Payment as PaymentSchema } from "/imports/collections/schemas";
import getDiscountsTotalForCart from "/imports/plugins/core/discounts/server/no-meteor/util/getDiscountsTotalForCart";
import xformOrderGroupToCommonOrder from "/imports/plugins/core/orders/server/util/xformOrderGroupToCommonOrder";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/payments/server/no-meteor/registration";
import addTaxesToGroup from "../../util/addTaxesToGroup";
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
 * @summary Calculate final shipping, discounts, surcharges, and taxes, and build an invoice object
 *   with the totals on it.
 * @param {String} currencyCode Currency code of totals
 * @param {Object} group The fulfillment group
 * @param {Number} groupDiscountTotal Total discount amount for group
 * @param {Number} groupSurchargeTotal Total surcharge amount for group
 * @returns {Object} Invoice object with totals
 */
function getInvoiceForFulfillmentGroup({
  currencyCode,
  group,
  groupDiscountTotal,
  groupSurchargeTotal,
  taxableAmount,
  taxTotal
}) {
  // Items
  const itemTotal = group.items.reduce((sum, item) => (sum + item.subtotal), 0);

  // Taxes
  const effectiveTaxRate = taxableAmount > 0 ? taxTotal / taxableAmount : 0;

  // Fulfillment
  const shippingTotal = group.shipmentMethod.rate || 0;
  const handlingTotal = group.shipmentMethod.handling || 0;
  const fulfillmentTotal = shippingTotal + handlingTotal;

  // Totals
  // To avoid rounding errors, be sure to keep this calculation the same between here and
  // `buildOrderInputFromCart.js` in the client code.
  const total = Math.max(0, itemTotal + fulfillmentTotal + taxTotal + groupSurchargeTotal - groupDiscountTotal);

  return {
    currencyCode,
    discounts: groupDiscountTotal,
    effectiveTaxRate,
    shipping: fulfillmentTotal,
    subtotal: itemTotal,
    surcharges: groupSurchargeTotal,
    taxableAmount,
    taxes: taxTotal,
    total
  };
}

/**
 * @summary Builds an order item
 * @param {Object} inputItem Order item input. See schema.
 * @param {String} currencyCode The order currency code
 * @param {Object} context an object containing the per-request state
 * @returns {Promise<Object>} An order item, matching the schema needed for insertion in the Orders collection
 */
async function buildOrderItem(inputItem, currencyCode, context) {
  const {
    addedAt,
    price,
    productConfiguration,
    quantity
  } = inputItem;

  const {
    catalogProduct: chosenProduct,
    catalogProductVariant: chosenVariant,
    price: finalPrice
  } = await context.queries.getCurrentCatalogPriceForProductConfiguration(productConfiguration, currencyCode, context.collections);

  if (finalPrice !== price) {
    throw new ReactionError("invalid", `Provided price for the "${chosenVariant.title}" item does not match current published price`);
  }

  if (!chosenVariant.canBackorder && (quantity > chosenVariant.inventoryAvailableToSell)) {
    throw new ReactionError("invalid-order-quantity", `Quantity ordered is more than available inventory for  "${chosenVariant.title}"`);
  }

  const now = new Date();
  const newItem = {
    _id: Random.id(),
    addedAt: addedAt || now,
    createdAt: now,
    optionTitle: chosenVariant && chosenVariant.optionTitle,
    parcel: chosenVariant.parcel,
    price: {
      amount: finalPrice,
      currencyCode
    },
    productId: chosenProduct._id,
    productSlug: chosenProduct.slug,
    productType: chosenProduct.type,
    productTagIds: chosenProduct.tagIds,
    productVendor: chosenProduct.vendor,
    quantity,
    shopId: chosenProduct.shopId,
    subtotal: quantity * finalPrice,
    title: chosenProduct.title,
    updatedAt: now,
    variantId: chosenVariant._id,
    variantTitle: chosenVariant.title,
    workflow: { status: "new", workflow: ["coreOrderWorkflow/created", "coreItemWorkflow/removedFromInventoryAvailableToSell"] }
  };

  for (const func of context.getFunctionsOfType("mutateNewOrderItemBeforeCreate")) {
    await func(context, { chosenProduct, chosenVariant, item: newItem }); // eslint-disable-line no-await-in-loop
  }

  return newItem;
}

/**
 * @summary Adds shipment method to the final fulfillment group
 * @param {Object} context - an object containing the per-request state
 * @param {Object} finalGroup Fulfillment group object pre shipment method addition
 * @param {Object} cleanedInput - Necessary orderInput. See SimpleSchema
 * @param {Object} groupInput - Original fulfillment group that we compose finalGroup from. See SimpleSchema
 * @param {String} discountTotal - Calculated discount total
 * @param {String} orderId - Randomized new orderId
 * @returns {Object} Fulfillment group object post shipment method addition
 */
async function addShipmentMethodToGroup(context, finalGroup, cleanedInput, groupInput, discountTotal, orderId) {
  const { order: orderInput } = cleanedInput;
  const { billingAddress, cartId, currencyCode } = orderInput;
  const { collections } = context;

  const commonOrder = await xformOrderGroupToCommonOrder({
    billingAddress,
    cartId,
    collections,
    currencyCode,
    group: finalGroup,
    orderId,
    discountTotal
  });

  // We are passing commonOrder in here, but we need the finalGroup.shipmentMethod data inside of final order, which doesn't get set until after this
  // but we need the data from this in order to set it
  const rates = await context.queries.getFulfillmentMethodsWithQuotes(commonOrder, context);
  const selectedFulfillmentMethod = rates.find((rate) => groupInput.selectedFulfillmentMethodId === rate.method._id);
  if (!selectedFulfillmentMethod) {
    throw new ReactionError("invalid", "The selected fulfillment method is no longer available." +
      " Fetch updated fulfillment options and try creating the order again with a valid method.");
  }
  finalGroup.shipmentMethod = {
    _id: selectedFulfillmentMethod.method._id,
    carrier: selectedFulfillmentMethod.method.carrier,
    currencyCode,
    label: selectedFulfillmentMethod.method.label,
    group: selectedFulfillmentMethod.method.group,
    name: selectedFulfillmentMethod.method.name,
    handling: selectedFulfillmentMethod.handlingPrice,
    rate: selectedFulfillmentMethod.shippingPrice
  };
}

/**
 * @summary Create all authorized payments for a potential order
 * @param {String} [accountId] The ID of the account placing the order
 * @param {Object} [billingAddress] Billing address for the order as a whole
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
 * @summary Compares expected total with actual total to make sure data is correct
 * @param {Object} finalGroup Fulfillment group object pre tax addition
 * @param {Object} groupInput - Original fulfillment group that we compose finalGroup from. See SimpleSchema
 * @param {String} discountTotal - Calculated discount total
 * @returns {undefined}
 */
function compareExpectedAndActualTotals(finalGroup, groupInput, discountTotal) {
  // For now we expect that the client has NOT included discounts in the expected total it sent.
  // Note that we don't currently know which parts of `discountTotal` go with which fulfillment groups.
  // This needs to be rewritten soon for discounts to work when there are multiple fulfillment groups.
  // Probably the client should be sending all applied discount IDs and amounts in the order input (by group),
  // and include total discount in `groupInput.totalPrice`, and then we simply verify that they are valid here.
  const expectedTotal = Math.max(groupInput.totalPrice - discountTotal, 0);

  // In order to prevent mismatch due to rounding, we convert these to strings before comparing. What we really
  // care about is, do these match to the specificity that the shopper will see (i.e. to the scale of the currency)?
  // No currencies have greater than 3 decimal places, so we'll use 3.
  const expectedTotalString = accounting.toFixed(expectedTotal, 3);
  const actualTotalString = accounting.toFixed(finalGroup.invoice.total, 3);

  if (expectedTotalString !== actualTotalString) {
    throw new ReactionError(
      "invalid",
      `Client provided total price ${expectedTotalString} for order group, but actual total price is ${actualTotalString}`
    );
  }
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
  const { Orders } = collections;

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
  const finalFulfillmentGroups = await Promise.all(fulfillmentGroups.map(async (groupInput) => {
    const finalGroup = {
      _id: Random.id(),
      address: groupInput.data ? groupInput.data.shippingAddress : null,
      items: groupInput.items,
      shopId: groupInput.shopId,
      type: groupInput.type,
      workflow: { status: "new", workflow: ["coreOrderWorkflow/notStarted"] }
    };

    // We save off the first shipping address found, for passing to payment services. They use this
    // for fraud detection.
    if (finalGroup.address && !shippingAddressForPayments) shippingAddressForPayments = finalGroup.address;

    // Build the final order item objects. As part of this, we look up the variant in the system and make sure that
    // the price is what the shopper expects it to be.
    finalGroup.items = await Promise.all(finalGroup.items.map((item) => buildOrderItem(item, currencyCode, context)));

    // Apply shipment method
    await addShipmentMethodToGroup(context, finalGroup, cleanedInput, groupInput, discountTotal, orderId);

    // Apply Taxes
    const { taxTotal, taxableAmount } = await addTaxesToGroup(context, finalGroup, orderInput, discountTotal, orderId);

    // Add some more properties for convenience
    finalGroup.itemIds = finalGroup.items.map((item) => item._id);
    finalGroup.totalItemQuantity = finalGroup.items.reduce((sum, item) => sum + item.quantity, 0);

    // Get surcharges to apply to group, if applicable
    const groupSurcharges = [];
    const commonOrder = await xformOrderGroupToCommonOrder({
      billingAddress,
      cartId,
      collections,
      currencyCode,
      group: finalGroup,
      orderId,
      discountTotal
    });

    for (const func of getFunctionsOfType("getSurcharges")) {
      const appliedSurcharges = await func(context, { commonOrder }); // eslint-disable-line
      appliedSurcharges.forEach((appliedSurcharge) => {
        // Set fulfillmentGroupId
        appliedSurcharge.fulfillmentGroupId = finalGroup._id;
        // Push to group surcharge array
        groupSurcharges.push(appliedSurcharge);
        // Push to overall order surcharge array
        orderSurcharges.push(appliedSurcharge);
      });
    }

    const groupSurchargeTotal = groupSurcharges.reduce((sum, surcharge) => sum + surcharge.amount, 0);

    finalGroup.invoice = getInvoiceForFulfillmentGroup({
      currencyCode,
      group: finalGroup,
      groupDiscountTotal: discountTotal,
      groupSurchargeTotal,
      taxableAmount,
      taxTotal
    });

    // Compare expected and actual totals to make sure client sees correct calculated price
    // Error if we calculate total price differently from what the client has shown as the preview.
    // It's important to keep this after adding and verifying the shipmentMethod and order item prices.
    compareExpectedAndActualTotals(finalGroup, groupInput, discountTotal);

    orderTotal += finalGroup.invoice.total;

    return finalGroup;
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
    referenceId: Random.id(),
    shipping: finalFulfillmentGroups,
    shopId,
    surcharges: orderSurcharges,
    totalItemQuantity: finalFulfillmentGroups.reduce((sum, group) => sum + group.totalItemQuantity, 0),
    updatedAt: now,
    workflow: {
      status: "new",
      workflow: ["coreOrderWorkflow/created"]
    }
  };

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
