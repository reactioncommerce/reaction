/* eslint camelcase: 0 */
import nock from "nock";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import stripeCapturePayment from "./stripeCapturePayment.js";

jest.mock("./getStripeInstanceForShop", () => jest.fn().mockImplementation(() => require("stripe")("STRIPE_API_KEY")));

const stripeCaptureResult = {
  id: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
  object: "charge",
  amount: 1999,
  amount_refunded: 0,
  application_fee: null,
  balance_transaction: "txn_17hZ6OBXXkbZQs3xvtVtXtQ3",
  captured: true,
  created: 1456206682,
  currency: "usd",
  customer: null,
  description: null,
  destination: null,
  dispute: null,
  failure_code: null,
  failure_message: null,
  fraud_details: {},
  invoice: null,
  livemode: false,
  metadata: {},
  order: null,
  paid: true,
  receipt_email: null,
  receipt_number: null,
  refunded: false,
  refunds: {
    object: "list",
    data: [],
    has_more: false,
    total_count: 0,
    url: "/v1/charges/ch_17hZ4wBXXkbZQs3xL5JhlSgS/refunds"
  },
  shipping: null,
  source: {
    id: "card_17hZ4wBXXkbZQs3xRVgvZONw",
    object: "card",
    address_city: null,
    address_country: null,
    address_line1: null,
    address_line1_check: null,
    address_line2: null,
    address_state: null,
    address_zip: null,
    address_zip_check: null,
    brand: "Visa",
    country: "US",
    customer: null,
    cvc_check: "pass",
    dynamic_last4: null,
    exp_month: 3,
    exp_year: 2019,
    fingerprint: "sMf9T3BK8Si2Nqme",
    funding: "credit",
    last4: "4242",
    metadata: {},
    name: "Brent Hoover",
    tokenization_method: null
  },
  statement_descriptor: null,
  status: "succeeded"
};

test("should call StripeApi.methods.captureCharge with the proper parameters and return saved = true", async () => {
  const paymentMethod = {
    processor: "Stripe",
    displayName: "Visa 4242",
    paymentPluginName: "reaction-stripe",
    method: "credit",
    transactionId: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
    amount: 19.99,
    status: "approved",
    mode: "capture",
    createdAt: new Date()
  };

  // Stripe Charge Nock
  nock("https://api.stripe.com:443")
    .post(`/v1/charges/${paymentMethod.transactionId}/capture`)
    .reply(200, stripeCaptureResult);

  const result = await stripeCapturePayment(mockContext, paymentMethod);

  expect(result.saved).toBe(true);
});

test("should should return an error if transactionId is not available", async () => {
  const paymentMethod = {
    processor: "Stripe",
    displayName: "Visa 4242",
    paymentPluginName: "reaction-stripe",
    method: "credit",
    amount: 19.99,
    status: "approved",
    mode: "capture",
    transactionId: "fake_transaction_id",
    createdAt: new Date()
  };

  const result = await stripeCapturePayment(mockContext, paymentMethod);
  expect(result.error.type).toBe("StripeConnectionError");
});
