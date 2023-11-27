import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import getAnonymousAccessToken from "@reactioncommerce/api-utils/getAnonymousAccessToken.js";
import { Order as OrderSchema, orderInputSchema, paymentInputSchema } from "../../simpleSchemas.js";
import { customOrderValidators } from "../../../src/registration.js";
import validateInitialOrderData from "./validateInitialOrderData.js";
import getFinalFulfillmentGroups from "./getFinalFulfillmentGroups.js";
import createPayments from "./createPayments.js";
import getReferenceId from "./getReferenceId.js";
import getCustomFields from "./getCustomFields.js";

const inputSchema = new SimpleSchema({
  "order": orderInputSchema,
  "payments": {
    type: Array,
    optional: true
  },
  "payments.$": paymentInputSchema
});

const orderModeSchema = new SimpleSchema({
  mode: {
    type: String,
    allowedValues: ["createOrderObject", "validateOrder"]
  }
});

/**
 * @summary Formats validation error to common error format
 * @param {Object} err Validation error object
 * @returns {Object[]} Array of error entries
 */
function formatErrors(err) {
  let errorEntries = [];
  if (err.errorType === "ClientError" && err.error === "validation-error") {
    errorEntries = (err.details || []).map((errorEntry) => {
      const errorObject = {
        errorName: "validation-error",
        errorType: "Schema validation Error",
        errorField: errorEntry.name || null,
        fieldValue: errorEntry.value || null,
        errorMessage: errorEntry.message || "No details"
      };
      return errorObject;
    });
  } else {
    let errorField;
    let fieldValue;
    if (err.eventData) {
      errorField = err.eventData.field;
      fieldValue = err.eventData.value;
    }
    const errorObject = {
      errorName: err.error,
      errorType: "ReactionError",
      errorField: errorField || null,
      fieldValue: fieldValue || null,
      errorMessage: err.reason || "No details"
    };
    errorEntries.push(errorObject);
  }
  return errorEntries;
}

/**
 * @name prepareOrder
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Validates if the input order details is valid and ready for order processing
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - order details, refer inputSchema
 * @param {String} mode - mode which define if the call is from placeOrder or validateOrder
 * @returns {Promise<Object>} output - order, token and validation results
 */
export default async function prepareOrder(context, input, mode) {
  const cleanedInput = inputSchema.clean(input);
  orderModeSchema.validate({ mode });
  const createOrderMode = mode === "createOrderObject";
  const validationResults = [];

  // Step01: Input data validation against input schema
  try {
    inputSchema.validate(cleanedInput);
  } catch (err) {
    if (createOrderMode) throw err;
    const validationErrors = formatErrors(err);
    validationResults.push(...validationErrors);
    return { errors: validationResults, success: false };
  }

  // Step02: Initial validation for shop/cart/user-id
  let initialValidationResult;
  try {
    initialValidationResult = await validateInitialOrderData(context, cleanedInput);
  } catch (err) {
    if (createOrderMode) throw err;
    const validationErrors = formatErrors(err);
    validationResults.push(...validationErrors);
    return { errors: validationResults, success: false };
  }

  const { shop, cart } = initialValidationResult;

  // Step03: Extract the rest of the required variables
  const { order: orderInput, payments: paymentsInput } = cleanedInput;
  const {
    billingAddress,
    cartId,
    currencyCode,
    customFields: customFieldsFromClient,
    email,
    fulfillmentGroups,
    ordererPreferredLanguage,
    shopId
  } = orderInput;
  const { accountId } = context;


  // Step04: Getting discount details. If no data, we get back empty values
  let getDiscountsResult;
  try {
    getDiscountsResult = await context.queries.getDiscountsTotalForCart(context, cart);
  } catch (err) {
    const validationErrors = formatErrors(err);
    validationResults.push(...validationErrors);
  }
  const { discounts, appliedPromotions, total: discountTotal } = getDiscountsResult;

  // Create array for surcharges to apply to order, if applicable
  // Array is populated inside `fulfillmentGroups.map()`
  let orderSurcharges = [];

  // Create orderId
  const orderId = Random.id();


  // Add more props to each fulfillment group, and validate/build the items in each group
  let orderTotal = 0;
  let shippingAddressForPayments = null;

  // Step
  let finalFulfillmentGroups = [];
  try {
    ({
      orderSurcharges,
      orderTotal,
      shippingAddressForPayments,
      finalFulfillmentGroups
    } = await getFinalFulfillmentGroups(context, {
      orderId,
      accountId,
      billingAddress,
      cartId,
      currencyCode,
      discountTotal,
      fulfillmentGroups,
      cart
    }));
  } catch (err) {
    if (createOrderMode) throw err;
    if (!err.eventData) {
      err.eventData = {
        field: "Fulfillment Group",
        value: "Invalid"
      };
    }
    const validationErrors = formatErrors(err);
    validationResults.push(...validationErrors);
  }

  const allValidateFuncs = context.getFunctionsOfType("validateOrderMethods");
  // Collect results from validation specific to each fulfillment-method
  if (allValidateFuncs && Array.isArray(allValidateFuncs) && allValidateFuncs.length) {
    for (const group of finalFulfillmentGroups) {
      const requiredMethodFunctionObject = allValidateFuncs.find((fn) => fn.key === group.shipmentMethod.name);
      const requiredMethodFunction = requiredMethodFunctionObject ? requiredMethodFunctionObject.handler : undefined;

      if (requiredMethodFunction) {
        // eslint-disable-next-line no-await-in-loop
        await requiredMethodFunction(context, orderInput, validationResults);
      }
    }
  }

  let payments;
  try {
    payments = await createPayments({
      accountId,
      billingAddress,
      context,
      currencyCode,
      email,
      orderTotal,
      paymentsInput,
      shippingAddress: shippingAddressForPayments,
      shop,
      mode // Pass on the same mode we received for prepareOrder
    });
  } catch (err) {
    if (createOrderMode) throw err;
    const validationErrors = formatErrors(err);
    validationResults.push(...validationErrors);
  }

  // Create anonymousAccessToken if no account ID
  const fullToken = accountId ? null : getAnonymousAccessToken();

  const now = new Date();

  const order = {
    _id: orderId,
    accountId,
    billingAddress,
    cartId,
    createdAt: now,
    currencyCode,
    discounts,
    email,
    ordererPreferredLanguage: ordererPreferredLanguage || null,
    shipping: finalFulfillmentGroups,
    shopId,
    surcharges: orderSurcharges,
    totalItemQuantity: finalFulfillmentGroups.reduce((sum, group) => sum + group.totalItemQuantity, 0),
    updatedAt: now,
    workflow: {
      status: "new",
      workflow: ["new"]
    },
    appliedPromotions
  };

  if (createOrderMode) {
    order.payments = payments;
  }

  if (fullToken) {
    const dbToken = { ...fullToken };
    // don't store the raw token in db, only the hash
    delete dbToken.token;
    order.anonymousAccessTokens = [dbToken];
  }


  let referenceId;
  try {
    referenceId = await getReferenceId(context, cart, order);
  } catch (err) {
    if (createOrderMode) throw err;
    const validationErrors = formatErrors(err);
    validationResults.push(...validationErrors);
  }
  order.referenceId = referenceId;

  let customFields;
  try {
    customFields = await getCustomFields(context, customFieldsFromClient, order);
  } catch (err) {
    if (createOrderMode) throw err;
    const validationErrors = formatErrors(err);
    validationResults.push(...validationErrors);
  }
  order.customFields = customFields;

  // Validate and Return
  let success = !(validationResults && validationResults.length > 0);

  let output;
  if (createOrderMode) {
    OrderSchema.validate(order);

    for (const customOrderValidateFunc of customOrderValidators) {
      await customOrderValidateFunc.fn(context, order); // eslint-disable-line no-await-in-loop
    }

    output = { order, fullToken, errors: validationResults, success };
  } else { // mode expected to be "validateOrder"
    const OrderWithoutPaymentsSchema = OrderSchema.omit("payments");
    try {
      OrderWithoutPaymentsSchema.validate(order);
    } catch (err) {
      const validationErrors = formatErrors(err);
      validationResults.push(...validationErrors);
      success = false;
    }
    output = { order: null, fullToken: null, errors: validationResults, success };
  }
  return output;
}
