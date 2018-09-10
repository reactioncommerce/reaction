import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import { Address as AddressSchema } from "/imports/collections/schemas";

const METHOD = "credit";
const PACKAGE_NAME = "example-paymentmethod";
const PAYMENT_METHOD_NAME = "iou_example";
const PROCESSOR = "IOU";

const paymentInputSchema = new SimpleSchema({
  billingAddress: AddressSchema,
  billingAddressId: {
    type: String,
    optional: true
  },
  fullName: String
});

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
  "data": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": orderItemsSchema,
  "selectedFulfillmentMethodId": String,
  "shopId": String,
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
  order: orderInputSchema,
  payment: paymentInputSchema
});

/**
 * @method placeOrderWithExampleIOUPayment
 * @summary As an example and for demos, this non-production payment method creates payments
 *   without charging any credit card
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<Object>} Object with `orders` property containing the created orders
 */
export default async function placeOrderWithExampleIOUPayment(context, input) {
  const cleanedInput = inputSchema.clean(input); // add default values and such
  inputSchema.validate(cleanedInput);

  const { order: orderInput, payment: paymentInput } = cleanedInput;
  const { billingAddress, billingAddressId, fullName } = paymentInput;
  const { mutations } = context;

  billingAddress._id = billingAddressId || Random.id();

  return mutations.orders.createOrder(context, {
    order: orderInput,
    async createPaymentForFulfillmentGroup(group) {
      return {
        _id: Random.id(),
        address: billingAddress,
        amount: group.invoice.total,
        createdAt: new Date(),
        data: {
          fullName,
          gqlType: "ExampleIOUPaymentData" // GraphQL union resolver uses this
        },
        displayName: `IOU from ${fullName}`,
        invoice: group.invoice,
        method: METHOD,
        mode: "authorize",
        name: PAYMENT_METHOD_NAME,
        paymentPluginName: PACKAGE_NAME,
        processor: PROCESSOR,
        riskLevel: "normal",
        shopId: group.shopId,
        status: "created",
        transactionId: Random.id(),
        transactions: []
      };
    }
  });
}
