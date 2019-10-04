/* eslint camelcase: 0 */
import nock from "nock";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import stripeListRefunds from "./stripeListRefunds.js";

jest.mock("./getStripeInstanceForShop", () => jest.fn().mockImplementation(() => require("stripe")("STRIPE_API_KEY")));

test("should call StripeApi.methods.listRefunds with the proper parameters and return a properly" +
"formatted list of refunds", async () => {
  const paymentMethod = {
    processor: "Stripe",
    displayName: "Visa 4242",
    paymentPluginName: "reaction-stripe",
    method: "credit",
    transactionId: "ch_17iCSlBXXkbZQs3xUpRw24mL",
    amount: 19.99,
    status: "completed",
    mode: "capture",
    createdAt: new Date(),
    workflow: {
      status: "new"
    },
    metadata: {}
  };

  const stripeRefundListResult = {
    object: "list",
    data: [
      {
        id: "re_17iCTeBXXkbZQs3xYZ3iJyB6",
        object: "refund",
        amount: 1999,
        balance_transaction: "txn_17iCTeBXXkbZQs3xl9FKE5an",
        charge: "ch_17iCSlBXXkbZQs3xUpRw24mL",
        created: 1456358130,
        currency: "usd",
        metadata: {},
        reason: null,
        receipt_number: null
      }
    ],
    has_more: false,
    url: "/v1/refunds"
  };

  nock("https://api.stripe.com:443")
    .get("/v1/refunds")
    .reply(200, stripeRefundListResult);

  const result = await stripeListRefunds(mockContext, paymentMethod);

  expect(result.length).toBe(1);
  expect(result[0].type).toBe("refund");
  expect(result[0].amount).toBe(19.99);
  expect(result[0].currency).toBe("usd");
});
