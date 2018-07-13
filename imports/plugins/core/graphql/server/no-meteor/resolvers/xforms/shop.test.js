import {
  assocShopInternalId,
  assocShopOpaqueId,
  decodeShopOpaqueId,
  encodeShopOpaqueId,
  xformShopInput
} from "./shop";

const testId = "12345";
const testOpaqueId = "cmVhY3Rpb24vc2hvcDoxMjM0NQ==";

test("encodeShopOpaqueId returns an opaque, base64-encoded, Shop-namespaced ID", () => {
  expect(encodeShopOpaqueId(testId)).toBe(testOpaqueId);
});

test("assocShopOpaqueId transforms the _id on an object to Shop-namespaced opaque ID", () => {
  const input = {
    _id: testId,
    foo: "baz"
  };
  expect(assocShopOpaqueId(input)).toEqual({
    _id: testOpaqueId,
    foo: "baz"
  });
});

test("decodeShopOpaqueId returns the internal ID from opaque ID", () => {
  expect(decodeShopOpaqueId(testOpaqueId)).toBe(testId);
});

test("assocShopInternalId transforms the _id on an object from Shop-namespaced opaque ID to internal", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(assocShopInternalId(input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});

test("xformShopInput transforms an input address to internal schema with internal IDs", () => {
  const input = {
    _id: testOpaqueId,
    foo: "baz"
  };
  expect(xformShopInput(input)).toEqual({
    _id: testId,
    foo: "baz"
  });
});
