/* eslint-disable require-jsdoc */
import { toArray, fromArray } from "./convert67";

function orderWithArray() {
  return {
    anonymousAccessTokens: [
      {
        hashedToken: "/kVAdMmF+/XyiOHl88MDik6HfJo8ON85lI2vVfCoVrw=",
        createdAt: new Date()
      }
    ]
  };
}

test("toArray base case", () => {
  const token = "unit-test";
  const order = toArray({ anonymousAccessToken: token });
  expect(order.anonymousAccessToken).toBeUndefined();
  expect(Array.isArray(order.anonymousAccessTokens)).toBe(true);
  expect(order.anonymousAccessTokens.length).toBe(1);
  expect(order.anonymousAccessTokens[0].createdAt).toBeTruthy();
  expect(order.anonymousAccessTokens[0].hashedToken).toBeTruthy();
});

test("toArray idempotent", () => {
  const input = orderWithArray();
  const order = toArray(input);
  expect(order.anonymousAccessToken).toBeUndefined();
  expect(Array.isArray(order.anonymousAccessTokens)).toBe(true);
  expect(order.anonymousAccessTokens.length).toBe(1);
  expect(order.anonymousAccessTokens[0].createdAt).toBeTruthy();
  expect(order).toEqual(input);
});

test("toArray handles no token", () => {
  const order = toArray({});
  expect(Array.isArray(order.anonymousAccessTokens)).toBe(true);
  expect(order.anonymousAccessTokens.length).toBe(0);
  expect(order.anonymousAccessToken).toBeUndefined();
});

test("fromArray base case", () => {
  const input = orderWithArray();
  const expectedHash = input.anonymousAccessTokens[0].hashedToken;
  const order = fromArray(input);
  expect(order.anonymousAccessTokens).toBeUndefined();
  expect(order.anonymousAccessToken).toBe(expectedHash);
});
