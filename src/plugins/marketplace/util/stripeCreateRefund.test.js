/* eslint camelcase: 0 */
import nock from "nock";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import stripeCreateRefund from "./stripeCreateRefund.js";

jest.mock("./getStripeApi", () => jest.fn().mockImplementation(() => "STRIPE_API_KEY"));

test("should call StripeApi.methods.createRefund with the proper parameters and return saved = true", async () => {
  const paymentMethod = {
    processor: "Stripe",
    displayName: "Visa 4242",
    paymentPluginName: "reaction-stripe",
    method: "credit",
    transactionId: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
    amount: 19.99,
    status: "completed",
    mode: "capture",
    createdAt: new Date(),
    workflow: { status: "new" },
    metadata: {}
  };

  const stripeRefundResult = {
    id: "re_17hZzSBXXkbZQs3xgmmEeOci",
    object: "refund",
    amount: 1999,
    balance_transaction: "txn_17hZzSBXXkbZQs3xr6d9YECZ",
    charge: "ch_17hZ4wBXXkbZQs3xL5JhlSgS",
    created: 1456210186,
    currency: "usd",
    metadata: {},
    reason: null,
    receipt_number: null
  };

  // Stripe Charge Nock
  nock("https://api.stripe.com:443")
    .post("/v1/refunds")
    .reply(200, stripeRefundResult);

  const result = await stripeCreateRefund(mockContext, paymentMethod);

  expect(result.saved).toBe(true);
});
