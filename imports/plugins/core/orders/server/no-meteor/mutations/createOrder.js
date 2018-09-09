import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";
import appEvents from "/imports/node-app/core/util/appEvents";
import getShippingRates from "/imports/plugins/core/shipping/server/no-meteor/util/getShippingRates";
import applyTaxesToFulfillmentGroup from "/imports/plugins/core/taxes/server/no-meteor/mutations/applyTaxesToFulfillmentGroup";
import { Address as AddressSchema, Invoice as InvoiceSchema, Order as OrderSchema, Payment as PaymentSchema } from "/imports/collections/schemas";
import findProductAndVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/findProductAndVariant";
import getDiscountsTotalForCart from "/imports/plugins/core/discounts/server/no-meteor/util/getDiscountsTotalForCart";

const orderItemsSchema = new SimpleSchema({
  "addedAt": {
    type: Date,
    optional: true
  },
  "price": Number,
  "productConfiguration": Object,
  "productConfiguration.productId": String,
  "productConfiguration.productVariantId": String,
  "quantity": {
    type: SimpleSchema.Integer,
    min: 1
  }
});

const orderFulfillmentGroupSchema = new SimpleSchema({
  "address": {
    type: AddressSchema,
    optional: true
  },
  "invoice": InvoiceSchema,
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": orderItemsSchema,
  "selectedFulfillmentMethodId": String,
  "totalPrice": Number,
  "type": {
    type: String,
    allowedValues: ["shipping"]
  }
});

const orderInputSchema = new SimpleSchema({
  "cartId": {
    type: String,
    optional: true
  },
  "currencyCode": String,
  "email": String,
  "fulfillmentGroups": {
    type: Array,
    minCount: 1
  },
  "fulfillmentGroups.$": orderFulfillmentGroupSchema,
  "shopId": String
});

const inputSchema = new SimpleSchema({
  afterValidate: {
    type: Function,
    optional: true
  },
  createPaymentForFulfillmentGroup: Function,
  order: orderInputSchema
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
  let exchangeRate = "1.00";

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
 * @summary Calculate final shipping, discounts, and taxes, and build an invoice object
 *   with the totals on it.
 * @param {Object} group The fulfillment group
 * @param {Number} discountTotal Total discount amount
 * @returns {Object} Invoice object with totals
 */
function getInvoiceForFulfillmentGroup(group, discountTotal) {
  // Build an invoice object with the final totals on it
  const itemTotal = group.items.reduce((sum, item) => (sum + item.subtotal), 0);
  const taxTotal = group.items.reduce((sum, item) => (sum + item.tax), 0);
  const shippingTotal = group.shipmentMethod.rate || 0;
  const handlingTotal = group.shipmentMethod.handling || 0;

  return {
    discounts: discountTotal,
    shipping: shippingTotal + handlingTotal,
    subtotal: itemTotal,
    taxes: taxTotal,
    total: Math.max(0, itemTotal + shippingTotal + handlingTotal + taxTotal - discountTotal)
  };
}

/**
 * @summary Builds an order item
 * @param {Object} inputItem Order item input. See schema.
 * @param {String} currencyCode The order currency code
 * @param {Object} collections Map of MongoDB collections
 * @returns {Promise<Object>} An order item, matching the schema needed for insertion in the Orders collection
 */
async function buildOrderItem(inputItem, currencyCode, collections) {
  const {
    addedAt,
    price,
    productConfiguration: {
      productId,
      productVariantId
    },
    quantity
  } = inputItem;

  const {
    catalogProduct: chosenProduct,
    variant: chosenVariant
  } = await findProductAndVariant(collections, productId, productVariantId);

  const variantPriceInfo = (chosenVariant.pricing && chosenVariant.pricing[currencyCode]) || {};
  const finalPrice = variantPriceInfo.price || chosenVariant.price;
  if (finalPrice !== price) {
    throw new ReactionError("invalid", `Provided price for the "${chosenVariant.title}" item does not match current published price`);
  }

  const now = new Date();
  const newItem = {
    _id: Random.id(),
    addedAt: addedAt || now,
    createdAt: now,
    isTaxable: (chosenVariant && chosenVariant.taxable) || false,
    optionTitle: chosenVariant && chosenVariant.optionTitle,
    parcel: chosenVariant.parcel,
    price: {
      amount: finalPrice,
      currencyCode
    },
    productId,
    productSlug: chosenProduct.slug,
    productType: chosenProduct.type,
    productVendor: chosenProduct.vendor,
    quantity,
    shopId: chosenProduct.shopId,
    subtotal: quantity * finalPrice,
    taxCode: chosenVariant.taxCode,
    title: chosenProduct.title,
    updatedAt: now,
    variantId: chosenVariant._id,
    variantTitle: chosenVariant.title,
    workflow: { status: "new", workflow: ["coreOrderWorkflow/created"] }
  };

  return newItem;
}

/**
 * @method createOrder
 * @summary Creates an order
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `order` property containing the created order
 */
export default async function createOrder(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { afterValidate, createPaymentForFulfillmentGroup, order: orderInput } = cleanedInput;
  const { cartId, currencyCode, email, fulfillmentGroups, shopId } = orderInput;
  const { accountId, account, collections } = context;
  const { Orders } = collections;

  // We are mixing concerns a bit here for now. This is for backwards compatibility with current
  // discount codes feature. We are planning to revamp discounts soon, but until then, we'll look up
  // any discounts on the related cart here.
  const { discounts, total: discountTotal } = await getDiscountsTotalForCart(collections, cartId);

  // Add more props to each fulfillment group, and validate/build the items in each group
  const finalFulfillmentGroups = await Promise.all(fulfillmentGroups.map(async (groupInput, index) => {
    const finalGroup = {
      _id: Random.id(),
      address: groupInput.address,
      items: groupInput.items,
      shopId: groupInput.shopId,
      type: groupInput.type,
      workflow: { status: "new", workflow: ["coreOrderWorkflow/notStarted"] }
    };

    // Verify that the price for the chosen shipment method on each group matches between what the client
    // provided and what the current quote is.
    const rates = await getShippingRates(finalGroup, context);
    finalGroup.shipmentMethod = rates.find((rate) => groupInput.selectedFulfillmentMethodId === rate._id);
    if (!finalGroup.shipmentMethod) {
      throw new ReactionError("invalid", "The selected fulfillment method is no longer available." +
        " Fetch updated fulfillment options and try creating the order again with a valid method.");
    }

    // Build the final order item objects. As part of this, we look up the variant in the system and make sure that
    // the price is what the shopper expects it to be.
    finalGroup.items = await Promise.all(finalGroup.items.map((item) => buildOrderItem(item, currencyCode, collections)));

    const { effectiveTaxRate, items: itemsWithTaxInfoAdded } = applyTaxesToFulfillmentGroup(collections, finalGroup);
    finalGroup.effectiveTaxRate = effectiveTaxRate;
    finalGroup.items = itemsWithTaxInfoAdded;

    finalGroup.itemIds = finalGroup.items.map((item) => item._id); // for convenience

    // Error if we calculate total price differently from what the client has shown as the preview.
    // It's important to keep this after adding and verifying the shipmentMethod and order item prices.
    finalGroup.invoice = getInvoiceForFulfillmentGroup(finalGroup, discountTotal);
    if (groupInput.totalPrice !== finalGroup.invoice.total) {
      throw new ReactionError(
        "invalid",
        `Client provided total price ${groupInput.totalPrice} for group with index ${index}, but actual total price is ${finalGroup.invoice.total}`
      );
    }

    return finalGroup;
  }));

  const currencyExchangeInfo = Promise.await(getCurrencyExchangeObject(currencyCode, shopId, account));

  if (afterValidate) afterValidate();

  // Create one charge per fulfillment group. This is necessary so that each group charge can be captured as it is
  // fulfilled, and so that each can be refunded or canceled separately.
  const chargedFulfillmentGroups = await Promise.all(finalFulfillmentGroups.map(async (group) => {
    const payment = await createPaymentForFulfillmentGroup(group);
    const paymentWithCurrency = { ...payment, currency: currencyExchangeInfo };
    PaymentSchema.validate(paymentWithCurrency);
    return {
      ...group,
      payment: paymentWithCurrency
    };
  }));

  // Create anonymousAccessToken if no account ID
  let anonymousAccessToken = null;
  if (!accountId) {
    anonymousAccessToken = Random.secret();
  }

  const now = new Date();

  const order = {
    _id: Random.id(),
    accountId,
    anonymousAccessToken: anonymousAccessToken && hashLoginToken(anonymousAccessToken),
    cartId,
    createdAt: now,
    currencyCode,
    discounts,
    email,
    shipping: chargedFulfillmentGroups,
    shopId,
    updatedAt: now,
    workflow: {
      status: "new",
      workflow: ["coreOrderWorkflow/created"]
    }
  };

  // Validate and save
  OrderSchema.validate(order);
  await Orders.insertOne(order);

  appEvents.emit("afterOrderCreate", order).catch((error) => {
    Logger.error("Error emitting afterOrderCreate", error);
  });

  return {
    order,
    token: anonymousAccessToken
  };
}
