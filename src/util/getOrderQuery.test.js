/* eslint-disable require-jsdoc */
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { getOrderQuery } from "./getOrderQuery.js";

function makeContext() {
  return { accountId: "unit-test-account-id", userHasPermission: () => true };
}
mockContext.validatePermissions = jest.fn("validatePermissions");
mockContext.collections.Groups.insert = jest.fn("collections.Groups.insertOne");
mockContext.collections.Groups.findOne = jest.fn("collections.Groups.findOne");
mockContext.accountId = "unit-test-account-id";
mockContext.userHasPermission = () => true;

test("getOrderQuery, user with `reaction:legacy:orders/read` permissions", async () => {
  const result = {
    _id: "unit-test-order-id",
    shopId: "unit-test-shop-id"
  };
  const shopId = "unit-test-shop-id";
  const orderId = "unit-test-order-id";
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(result));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  const query = await getOrderQuery(mockContext, { _id: orderId }, shopId, null);
  expect(query).toMatchObject(result);
  expect(query.accountId).toBeUndefined();
});

test("getOrderQuery, user owns order", async () => {
  const result = {
    _id: "unit-test-order-id",
    accountId: "account-id",
    shopId: "unit-test-shop-id"
  };
  const shopId = "unit-test-shop-id";
  const orderId = "unit-test-order-id";
  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(result));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  const query = await getOrderQuery(mockContext, { _id: orderId }, shopId, null);
  expect(query).toMatchObject(result);
  expect(query.accountId).toEqual(result.accountId);
});

test("getOrderQuery anonymous with token", async () => {
  const result = {
    referenceId: "unit-test-order-reference-id",
    accountId: "account-id",
    shopId: "unit-test-shop-id",
    anonymousAccessTokens: [{ hashedToken: hashToken("unit-test-token") }]
  };

  mockContext.collections.Orders.findOne.mockReturnValueOnce(Promise.resolve(result));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  const token = "unit-test-token";
  const query = await getOrderQuery(mockContext, { referenceId: result.referenceId }, result.shopId, token);
  expect(query).toMatchObject(result);
  expect(query.anonymousAccessTokens[0].hashedToken).toBe(hashToken(token));
});

test("getOrderQuery access denied", async () => {
  const shopId = "unit-test-shop-id";
  const referenceId = "unit-test-order-reference-id";
  const context = makeContext();
  context.userHasPermission = () => false;
  delete context.accountId;
  const query = getOrderQuery(mockContext, { referenceId }, shopId, null);
  expect(query).rejects.toThrow();
});
