import Random from "@reactioncommerce/random";

const METHOD = "credit";
const PACKAGE_NAME = "example-paymentmethod";
const PAYMENT_METHOD_NAME = "iou_example";

// NOTE: The "processor" value is lowercased and then prefixed to various payment Meteor method names,
// so for example, if this is "Example", the list refunds method is expected to be named "example/refund/list"
const PROCESSOR = "Example";

/**
 * @summary As an example and for demos, this non-production payment method creates a payment
 *   without charging any credit card
 * @param {Object} context The request context
 * @param {Object} input Input necessary to create a payment
 * @returns {Object} The payment object in schema expected by the orders plugin
 */
export default async function exampleCreateAuthorizedPayment(context, input) {
  const {
    amount,
    billingAddress,
    shopId,
    paymentData: {
      fullName
    }
  } = input;

  return {
    _id: Random.id(),
    address: billingAddress,
    amount,
    createdAt: new Date(),
    data: {
      fullName,
      gqlType: "ExampleIOUPaymentData" // GraphQL union resolver uses this
    },
    displayName: `IOU from ${fullName}`,
    method: METHOD,
    mode: "authorize",
    name: PAYMENT_METHOD_NAME,
    paymentPluginName: PACKAGE_NAME,
    processor: PROCESSOR,
    riskLevel: "normal",
    shopId,
    status: "created",
    transactionId: Random.id(),
    transactions: []
  };
}
