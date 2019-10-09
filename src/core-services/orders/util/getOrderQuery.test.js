/* eslint-disable require-jsdoc */
import { getOrderQuery } from "./getOrderQuery.js";

function makeContext() {
  return { accountId: "unit-test-account-id", userHasPermission: () => true };
}

test("getOrderQuery shop admin", () => {
  const shopId = "unit-test-shop-id";
  const orderId = "unit-test-order-id";
  const context = makeContext();
  const query = getOrderQuery(context, { _id: orderId }, shopId, null);
  expect(query).toMatchObject({ _id: "unit-test-order-id", shopId });
  expect(query.accountId).toBeUndefined();
});

test("getOrderQuery shopper", () => {
  const shopId = "unit-test-shop-id";
  const referenceId = "unit-test-order-reference-id";
  const context = makeContext();
  context.userHasPermission = () => false;
  const query = getOrderQuery(context, { referenceId }, shopId, null);
  expect(query).toMatchObject({ referenceId, shopId, accountId: context.accountId });
});

test("getOrderQuery anonymous", () => {
  const shopId = "unit-test-shop-id";
  const referenceId = "unit-test-order-reference-id";
  const context = makeContext();
  context.userHasPermission = () => false;
  delete context.accountId;
  const token = "unit-test-token";
  const query = getOrderQuery(context, { referenceId }, shopId, token);
  expect(query).toMatchObject({ referenceId, shopId });
  expect(Buffer.from(query["anonymousAccessTokens.hashedToken"], "base64").toString("hex")).toHaveLength(64);
});

test("getOrderQuery access denied", () => {
  const shopId = "unit-test-shop-id";
  const referenceId = "unit-test-order-reference-id";
  const context = makeContext();
  context.userHasPermission = () => false;
  delete context.accountId;
  expect(() => {
    getOrderQuery(context, { referenceId }, shopId, null);
  }).toThrow(/denied/i);
});
